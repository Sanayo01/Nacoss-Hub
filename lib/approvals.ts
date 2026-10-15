import type { Prisma } from "@prisma/client";
import { getTreasurerSpendingLimit, resolveApprovalPolicy } from "@/config/approvals";
import { db } from "@/lib/db";
import { appendAuditLog } from "@/lib/audit";
import type { OfficeSlug } from "@/lib/admin-auth";
import { sendOfficeNotification } from "@/lib/mailer";
import { approveMinutesInTransaction } from "@/lib/minutes";
import { EXECUTIVES_LIST } from "@/config/executives";

type ApprovalTransaction = Prisma.TransactionClient;
type ApprovalHandler = (
  tx: ApprovalTransaction,
  payload: Record<string, unknown>,
  makerOffice: OfficeSlug,
  decidingOffice: OfficeSlug
) => Promise<void>;

const handlers = new Map<string, ApprovalHandler>();

export function registerApprovalHandler(type: string, handler: ApprovalHandler): void {
  handlers.set(type, handler);
}

async function publishAnnouncementInTransaction(
  tx: ApprovalTransaction,
  payload: Record<string, unknown>,
  office: OfficeSlug,
  urgent: boolean
) {
  const title = String(payload.title ?? "");
  const body = String(payload.body ?? "");
  const category = String(payload.category ?? "General");
  if (!title || !body) throw new Error("Approved announcement is missing required content");
  const announcement = await tx.announcement.create({
    data: {
      title,
      body,
      category: urgent ? "Urgent" : category,
      pinned: urgent || Boolean(payload.pinned),
      authorOfficeSlug: office,
    },
  });
  const offices = EXECUTIVES_LIST.map(({ officeSlug }) => officeSlug);
  await tx.notification.createMany({
    data: offices.map((recipientOffice) => ({
      office: recipientOffice,
      title: urgent ? "Urgent executive announcement" : "Official executive announcement",
      message: title,
      link: "/announcements",
      kind: "ANNOUNCEMENT",
    })),
  });
  await appendAuditLog({
    action: urgent ? "URGENT_ANNOUNCEMENT_PUBLISHED" : "OFFICIAL_ANNOUNCEMENT_PUBLISHED",
    office,
    entityType: "Announcement",
    entityId: announcement.id,
    details: { title, category: announcement.category },
    occurredAt: new Date().toISOString(),
  }, tx);
}

registerApprovalHandler("OFFICIAL_ANNOUNCEMENT", async (tx, payload, office) => {
  await publishAnnouncementInTransaction(tx, payload, office, false);
  if (typeof payload.draftId === "string") {
    await tx.announcementDraft.update({
      where: { id: payload.draftId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
  }
});

registerApprovalHandler("URGENT_ANNOUNCEMENT", async (tx, payload, office) => {
  await publishAnnouncementInTransaction(tx, payload, office, true);
  if (typeof payload.draftId === "string") {
    await tx.announcementDraft.update({
      where: { id: payload.draftId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
  }
});

registerApprovalHandler("EVENT_BUDGET", async (tx, payload, makerOffice) => {
  const eventId = String(payload.eventId ?? "");
  const event = await tx.socialEvent.findUnique({ where: { id: eventId } });
  if (!event || event.status !== "PENDING_APPROVAL") throw new Error("Event is not awaiting approval");
  const calendarEvent = await tx.calendarEvent.create({
    data: {
      title: event.title,
      description: event.description,
      location: event.venue,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      category: "Event",
    },
  });
  await tx.socialEvent.update({
    where: { id: event.id },
    data: { status: "APPROVED", calendarEventId: calendarEvent.id },
  });
  await appendAuditLog({
    action: "SOCIAL_EVENT_APPROVED_AND_PUBLISHED",
    office: "treasurer",
    entityType: "SocialEvent",
    entityId: event.id,
    details: { title: event.title, makerOffice, calendarEventId: calendarEvent.id },
    occurredAt: new Date().toISOString(),
  }, tx);
});

registerApprovalHandler("ROLE_CHANGE", async (tx, payload, _makerOffice, decidingOffice) => {
  const platformRequestId = String(payload.platformRequestId ?? "");
  if (!platformRequestId) {
    await tx.notification.create({
      data: {
        office: decidingOffice,
        title: "Approved action",
        message: `${String(payload.title ?? "Role change")} was approved and recorded.`,
        link: "/office/approvals",
        kind: "APPROVAL",
      },
    });
    await appendAuditLog({
      action: "ROLE_CHANGE_APPROVED_AND_RECORDED",
      office: decidingOffice,
      entityType: "ApprovalRequest",
      details: { title: String(payload.title ?? "Role change"), implementation: "recorded only" },
      occurredAt: new Date().toISOString(),
    }, tx);
    return;
  }
  const request = await tx.platformRequest.findUnique({ where: { id: platformRequestId } });
  if (!request || request.kind !== "TECHNICAL_CHANGE" || request.status !== "PENDING_APPROVAL") {
    throw new Error("Technical change request is not awaiting approval");
  }
  await tx.platformRequest.update({ where: { id: request.id }, data: { status: "APPROVED" } });
  await appendAuditLog({
    action: "TECHNICAL_CHANGE_APPROVED",
    office: decidingOffice,
    entityType: "PlatformRequest",
    entityId: request.id,
    details: { title: request.title },
    occurredAt: new Date().toISOString(),
  }, tx);
});

registerApprovalHandler("MINUTES_APPROVAL", async (tx, payload, _makerOffice, decidingOffice) => {
  await approveMinutesInTransaction(tx, String(payload.minutesId ?? ""), decidingOffice);
});

registerApprovalHandler("OFFICIAL_LETTER_APPROVAL", async (tx, payload, makerOffice, decidingOffice) => {
  if (makerOffice === "general-secretary") {
    throw new Error("The General Secretary cannot approve their own official letter");
  }
  const id = String(payload.letterId ?? "");
  const letter = await tx.officialLetter.findUnique({ where: { id } });
  if (!letter || letter.status !== "PENDING") throw new Error("Official letter is not awaiting approval");
  await tx.officialLetter.update({
    where: { id },
    data: { status: "APPROVED", approvedBy: decidingOffice, approvedAt: new Date() },
  });
  await appendAuditLog({
    action: "OFFICIAL_LETTER_APPROVED",
    office: decidingOffice,
    entityType: "OfficialLetter",
    entityId: id,
    details: { reference: letter.reference },
    occurredAt: new Date().toISOString(),
  }, tx);
});

registerApprovalHandler("VP_MEETING_REQUEST", async (tx, payload, office) => {
  const date = new Date(String(payload.date ?? ""));
  if (!Number.isFinite(date.getTime()) || date <= new Date()) throw new Error("Meeting request date is invalid");
  const meeting = await tx.meeting.create({
    data: {
      title: String(payload.title ?? ""),
      date,
      venue: String(payload.venue ?? ""),
      agenda: String(payload.agenda ?? ""),
      mandatory: Boolean(payload.mandatory),
      createdBy: office,
      reminderAt: new Date(date.getTime() - 48 * 60 * 60 * 1000),
      rsvps: { create: EXECUTIVES_LIST.map(({ officeSlug }) => ({ office: officeSlug })) },
    },
  });
  const offices = EXECUTIVES_LIST.map(({ officeSlug }) => officeSlug);
  await tx.notification.createMany({
    data: offices.map((officeSlug) => ({
      office: officeSlug,
      title: "New executive meeting",
      message: `${meeting.title} — ${meeting.date.toLocaleString()}`,
      link: "/office/meetings",
      kind: "MEETING",
    })),
  });
  await appendAuditLog({
    action: "VP_MEETING_REQUEST_APPROVED",
    office,
    entityType: "Meeting",
    entityId: meeting.id,
    occurredAt: new Date().toISOString(),
  }, tx);
});

for (const type of ["GENERAL_ACTION", "OFFICE_ACTIVATION", "FULL_STUDENT_DATA_EXPORT", "SPENDING"]) {
  registerApprovalHandler(type, async (tx, payload, office) => {
    await tx.notification.create({
      data: {
        office,
        title: "Approved action",
        message: `${String(payload.title ?? type)} was approved and is ready for its office workflow.`,
        link: "/office/approvals",
        kind: "APPROVAL",
      },
    });
  });
}

registerApprovalHandler("SIWES_PLACEMENT_APPROVAL", async (tx, payload, office) => {
  const id = String(payload.id ?? "");
  const isApproved = Boolean(payload.isApproved);
  await tx.siwesPlacement.update({ where: { id }, data: { isApproved } });
  await appendAuditLog({
    action: "SIWES_PLACEMENT_MODERATED",
    office,
    entityType: "SiwesPlacement",
    entityId: id,
    details: { isApproved },
    occurredAt: new Date().toISOString(),
  }, tx);
});

registerApprovalHandler("ALUMNUS_APPROVAL", async (tx, payload, office) => {
  const id = String(payload.id ?? "");
  const isApproved = Boolean(payload.isApproved);
  await tx.alumnus.update({ where: { id }, data: { isApproved } });
  await appendAuditLog({
    action: "ALUMNUS_MODERATED",
    office,
    entityType: "Alumnus",
    entityId: id,
    details: { isApproved },
    occurredAt: new Date().toISOString(),
  }, tx);
});

registerApprovalHandler("SIWES_PLACEMENT_DELETE", async (tx, payload, office) => {
  const id = String(payload.id ?? "");
  await tx.siwesPlacement.delete({ where: { id } });
  await appendAuditLog({
    action: "SIWES_PLACEMENT_DELETED",
    office,
    entityType: "SiwesPlacement",
    entityId: id,
    occurredAt: new Date().toISOString(),
  }, tx);
});

registerApprovalHandler("ALUMNUS_DELETE", async (tx, payload, office) => {
  const id = String(payload.id ?? "");
  await tx.alumnus.delete({ where: { id } });
  await appendAuditLog({
    action: "ALUMNUS_DELETED",
    office,
    entityType: "Alumnus",
    entityId: id,
    occurredAt: new Date().toISOString(),
  }, tx);
});

registerApprovalHandler("REMOVAL_REQUEST_RESOLUTION", async (tx, payload, office) => {
  const id = String(payload.id ?? "");
  const isResolved = Boolean(payload.isResolved);
  await tx.removalRequest.update({ where: { id }, data: { isResolved } });
  await appendAuditLog({
    action: "REMOVAL_REQUEST_RESOLVED",
    office,
    entityType: "RemovalRequest",
    entityId: id,
    details: { isResolved },
    occurredAt: new Date().toISOString(),
  }, tx);
});

export type ApprovalRequestInput = {
  type: string;
  payload: Record<string, unknown>;
  makerOffice: OfficeSlug;
  expiresInHours?: number;
};

export async function createApprovalRequestInTransaction(
  tx: ApprovalTransaction,
  input: ApprovalRequestInput
) {
  if (!handlers.has(input.type)) throw new Error(`No approval handler registered for ${input.type}`);
  const policy = resolveApprovalPolicy(input.type, input.makerOffice, input.payload);
  const expiresAt = new Date(Date.now() + (input.expiresInHours ?? 72) * 60 * 60 * 1000);
  if (!Number.isFinite(expiresAt.getTime()) || expiresAt <= new Date()) {
    throw new Error("Approval expiry must be in the future");
  }
  const request = await tx.approvalRequest.create({
    data: {
      type: input.type,
      payload: JSON.stringify(input.payload),
      makerOffice: input.makerOffice,
      requiredApprovers: JSON.stringify(policy.approvers),
      approvalMode: policy.mode,
      expiresAt,
    },
  });
  await tx.notification.createMany({
    data: policy.approvers.map((office) => ({
      office,
      title: "Approval requested",
      message: `${input.type.replaceAll("_", " ")} requires your review.`,
      link: "/office/approvals",
      kind: "APPROVAL",
    })),
  });
  await appendAuditLog({
    action: "APPROVAL_REQUESTED",
    office: input.makerOffice,
    entityType: "ApprovalRequest",
    entityId: request.id,
    details: { type: request.type, requiredApprovers: policy.approvers, approvalMode: policy.mode },
    occurredAt: new Date().toISOString(),
  }, tx);
  return { request, approvers: policy.approvers };
}

export async function notifyApprovalRequestApprovers(type: string, approvers: OfficeSlug[]) {
  for (const office of approvers) {
    await sendOfficeNotification(office, "Approval requested", `${type.replaceAll("_", " ")} requires your review.`);
  }
}

export async function createApprovalRequest(input: ApprovalRequestInput) {
  const result = await db.$transaction((tx) => createApprovalRequestInTransaction(tx, input));
  await notifyApprovalRequestApprovers(input.type, result.approvers);
  return result.request;
}

export async function getPendingApprovals(office: OfficeSlug) {
  const now = new Date();
  const expired = await db.approvalRequest.findMany({
    where: { status: "PENDING", expiresAt: { lte: now } },
  });
  for (const request of expired) {
    await db.$transaction(async (tx) => {
      const changed = await tx.approvalRequest.updateMany({
        where: { id: request.id, status: "PENDING" },
        data: { status: "EXPIRED", decidedBy: "system" },
      });
      if (changed.count) {
        await appendAuditLog({
          action: "APPROVAL_EXPIRED",
          office: "system",
          entityType: "ApprovalRequest",
          entityId: request.id,
          occurredAt: new Date().toISOString(),
        }, tx);
      }
    });
  }

  const requests = await db.approvalRequest.findMany({
    where: { status: "PENDING", expiresAt: { gt: now } },
    include: { decisions: true },
    orderBy: { createdAt: "asc" },
  });
  return requests.filter((request) => {
    const required = JSON.parse(request.requiredApprovers) as string[];
    return required.includes(office) && !request.decisions.some((decision) => decision.office === office);
  });
}

export async function listApprovalRequests(office: OfficeSlug, actingFor?: OfficeSlug) {
  const [madeByOffice, pending] = await Promise.all([
    db.approvalRequest.findMany({
      where: { makerOffice: office },
      include: { decisions: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.approvalRequest.findMany({
      where: { status: "PENDING" },
      include: { decisions: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);
  const authorizedPending = pending.filter((request) =>
    (JSON.parse(request.requiredApprovers) as string[]).some((required) =>
      required === office || required === actingFor
    )
  );
  const requests = [...madeByOffice, ...authorizedPending];
  return requests.filter((request, index) =>
    requests.findIndex((candidate) => candidate.id === request.id) === index
  );
}

export async function decideApproval(input: {
  requestId: string;
  office: OfficeSlug;
  actingFor?: OfficeSlug;
  decision: "APPROVED" | "REJECTED";
  reason?: string;
}) {
  if (input.decision === "REJECTED" && !input.reason?.trim()) {
    throw new Error("A rejection reason is required");
  }

  const updated = await db.$transaction(async (tx) => {
    const request = await tx.approvalRequest.findUnique({
      where: { id: input.requestId },
      include: { decisions: true },
    });
    if (!request || request.status !== "PENDING") throw new Error("Approval request is no longer pending");
    if (request.expiresAt <= new Date()) throw new Error("Approval request has expired");
    const approverOffice = input.actingFor ?? input.office;
    const requiredApprovers = JSON.parse(request.requiredApprovers) as OfficeSlug[];
    if (request.makerOffice === input.office) throw new Error("The maker cannot approve their own request");
    if (!requiredApprovers.includes(approverOffice)) throw new Error("This office is not an approver");
    if (request.decisions.some((decision) => decision.office === input.office || (decision.actingFor ?? decision.office) === approverOffice)) {
      throw new Error("This office has already decided");
    }

    await tx.approvalDecision.create({
      data: {
        approvalRequestId: request.id,
        office: input.office,
        actingFor: input.actingFor ?? null,
        decision: input.decision,
        reason: input.reason?.trim() || null,
      },
    });
    const allDecisions = [
      ...request.decisions.map((decision) => ({ office: decision.actingFor ?? decision.office, decision: decision.decision })),
      { office: approverOffice, decision: input.decision },
    ];
    const approvedCount = allDecisions.filter(({ decision }) => decision === "APPROVED").length;
    const hasRejection = input.decision === "REJECTED";
    const fullyApproved = request.approvalMode === "ALL"
      ? requiredApprovers.every((office) => allDecisions.some((item) => item.office === office && item.decision === "APPROVED"))
      : approvedCount > 0;
    const nextStatus = hasRejection ? "REJECTED" : fullyApproved ? "APPROVED" : "PENDING";

    if (nextStatus === "APPROVED") {
      const handler = handlers.get(request.type);
      if (!handler) throw new Error(`No approval handler registered for ${request.type}`);
      await handler(
        tx,
        JSON.parse(request.payload) as Record<string, unknown>,
        request.makerOffice as OfficeSlug,
        approverOffice
      );
    }
    if (nextStatus === "REJECTED" && request.type === "OFFICIAL_LETTER_APPROVAL") {
      const letterId = String((JSON.parse(request.payload) as Record<string, unknown>).letterId ?? "");
      await tx.officialLetter.updateMany({
        where: { id: letterId, status: "PENDING" },
        data: { status: "REJECTED" },
      });
    }
    if (nextStatus === "REJECTED") {
      const payload = JSON.parse(request.payload) as Record<string, unknown>;
      if (request.type === "OFFICIAL_ANNOUNCEMENT" || request.type === "URGENT_ANNOUNCEMENT") {
        const draftId = String(payload.draftId ?? "");
        if (draftId) {
          await tx.announcementDraft.updateMany({ where: { id: draftId, status: "PENDING" }, data: { status: "REJECTED" } });
        }
      }
      if (request.type === "EVENT_BUDGET") {
        const eventId = String(payload.eventId ?? "");
        if (eventId) {
          await tx.socialEvent.updateMany({ where: { id: eventId, status: "PENDING_APPROVAL" }, data: { status: "REJECTED" } });
        }
      }
      if (request.type === "ROLE_CHANGE") {
        const platformRequestId = String(payload.platformRequestId ?? "");
        if (platformRequestId) {
          await tx.platformRequest.updateMany({ where: { id: platformRequestId, kind: "TECHNICAL_CHANGE", status: "PENDING_APPROVAL" }, data: { status: "REJECTED" } });
        }
      }
      if (request.type === "EXPENDITURE_REQUEST" || request.type === "EXPENDITURE_PRESIDENT_APPROVAL") {
        const expenditureRequestId = String(payload.expenditureRequestId ?? "");
        if (expenditureRequestId) {
          await tx.expenditureRequest.updateMany({
            where: { id: expenditureRequestId, status: { in: ["PENDING_TREASURER", "PENDING_PRESIDENT"] } },
            data: { status: "REJECTED" },
          });
        }
      }
    }
    const updated = await tx.approvalRequest.update({
      where: { id: request.id },
      data: {
        status: nextStatus,
        reason: input.reason?.trim() || null,
        decidedBy: nextStatus === "PENDING" ? null : input.office,
      },
    });
    await tx.notification.create({
      data: {
        office: request.makerOffice,
        title: nextStatus === "PENDING" ? "Approval recorded" : `Request ${nextStatus.toLowerCase()}`,
        message: `${request.type.replaceAll("_", " ")}: ${nextStatus.toLowerCase()}.`,
        link: "/office/approvals",
        kind: "APPROVAL",
      },
    });
    await appendAuditLog({
      action: `APPROVAL_${input.decision}`,
      office: input.office,
      entityType: "ApprovalRequest",
      entityId: request.id,
      details: { status: nextStatus, reason: input.reason?.trim() || null, actingFor: input.actingFor ?? null },
      occurredAt: new Date().toISOString(),
    }, tx);
    return updated;
  });
  await sendOfficeNotification(
    updated.makerOffice as OfficeSlug,
    `Approval ${updated.status.toLowerCase()}`,
    `${updated.type.replaceAll("_", " ")}: ${updated.status.toLowerCase()}.`
  );
  if (updated.type === "EXPENDITURE_REQUEST" && updated.status === "APPROVED") {
    const payload = JSON.parse(updated.payload) as Record<string, unknown>;
    const expenditure = await db.expenditureRequest.findFirst({
      where: { id: String(payload.expenditureRequestId ?? ""), status: "PENDING_PRESIDENT" },
    });
    if (expenditure?.approvalRequestId) {
      await sendOfficeNotification("president", "Approval requested", "EXPENDITURE REQUEST requires your review.");
    }
  }
  return updated;
}

async function recordApprovedExpenditure(
  tx: ApprovalTransaction,
  expenditureRequestId: string,
  recordedBy: OfficeSlug
) {
  const request = await tx.expenditureRequest.findUnique({ where: { id: expenditureRequestId } });
  if (!request) throw new Error("Expenditure request not found.");
  await tx.ledgerEntry.create({
    data: {
      kind: "EXPENDITURE",
      title: request.title,
      office: request.office,
      event: request.event,
      term: request.term,
      amount: request.amount,
      receiptRef: request.receiptRef,
      recordedBy,
    },
  });
  await tx.expenditureRequest.update({ where: { id: request.id }, data: { status: "APPROVED" } });
  await appendAuditLog({
    action: "EXPENDITURE_APPROVED_AND_RECORDED",
    office: recordedBy,
    entityType: "ExpenditureRequest",
    entityId: request.id,
    details: { amount: request.amount, office: request.office, event: request.event, recordOnly: true },
    occurredAt: new Date().toISOString(),
  }, tx);
}

registerApprovalHandler("EXPENDITURE_REQUEST", async (tx, payload, makerOffice) => {
  const id = String(payload.expenditureRequestId ?? "");
  const request = await tx.expenditureRequest.findUnique({ where: { id } });
  if (!request || request.status !== "PENDING_TREASURER") throw new Error("Expenditure request is not awaiting Treasurer review.");
  if (request.amount > getTreasurerSpendingLimit()) {
    const next = await createApprovalRequestInTransaction(tx, {
      type: "EXPENDITURE_PRESIDENT_APPROVAL",
      makerOffice,
      payload: { expenditureRequestId: request.id, title: request.title, amount: request.amount },
    });
    await tx.expenditureRequest.update({
      where: { id: request.id },
      data: { status: "PENDING_PRESIDENT", approvalRequestId: next.request.id },
    });
    return;
  }
  await recordApprovedExpenditure(tx, request.id, "treasurer");
});

registerApprovalHandler("EXPENDITURE_PRESIDENT_APPROVAL", async (tx, payload) => {
  const id = String(payload.expenditureRequestId ?? "");
  const request = await tx.expenditureRequest.findUnique({ where: { id } });
  if (!request || request.status !== "PENDING_PRESIDENT") throw new Error("Expenditure request is not awaiting President approval.");
  await recordApprovedExpenditure(tx, request.id, "president");
});
