import { db } from "@/lib/db";
import { appendAuditLog } from "@/lib/audit";
import type { MinutesActionItem } from "@/lib/minutes";
import type { OfficeSlug } from "@/lib/admin-auth";
import type { Prisma } from "@prisma/client";
import { createApprovalRequestInTransaction, notifyApprovalRequestApprovers } from "@/lib/approvals";

export async function getMinutesWorkspace() {
  const meetings = await db.meeting.findMany({
    include: { rsvps: true },
    orderBy: { date: "desc" },
    take: 100,
  });
  const minutes = await db.meetingMinutes.findMany({ orderBy: { updatedAt: "desc" } });
  return meetings.map((meeting) => ({
    ...meeting,
    minutes: minutes.find((item) => item.meetingId === meeting.id) ?? null,
  }));
}

export async function saveMinutesDraft(input: {
  meetingId: string;
  office: OfficeSlug;
  content: string;
  attendance: string[];
  agendaItems: MinutesActionItem[];
  submit: boolean;
}) {
  return db.$transaction((tx) => saveMinutesDraftInTransaction(tx, input));
}

export async function saveMinutesDraftInTransaction(
  tx: Prisma.TransactionClient,
  input: {
    meetingId: string;
    office: OfficeSlug;
    content: string;
    attendance: string[];
    agendaItems: MinutesActionItem[];
    submit: boolean;
  }
) {
    const meeting = await tx.meeting.findUnique({ where: { id: input.meetingId } });
    if (!meeting) throw new Error("Meeting not found");
    const existing = await tx.meetingMinutes.findUnique({ where: { meetingId: input.meetingId } });
    if (existing?.status === "LOCKED") throw new Error("Approved minutes are locked");
    const minutes = await tx.meetingMinutes.upsert({
      where: { meetingId: input.meetingId },
      create: {
        meetingId: input.meetingId,
        content: input.content,
        attendance: JSON.stringify(input.attendance),
        agendaItems: JSON.stringify(input.agendaItems),
        status: input.submit ? "PENDING" : "DRAFT",
        draftedBy: input.office,
        submittedAt: input.submit ? new Date() : null,
      },
      update: {
        content: input.content,
        attendance: JSON.stringify(input.attendance),
        agendaItems: JSON.stringify(input.agendaItems),
        status: input.submit ? "PENDING" : "DRAFT",
        draftedBy: input.office,
        submittedAt: input.submit ? new Date() : null,
      },
    });
    await appendAuditLog({
      action: input.submit ? "MINUTES_SUBMITTED" : "MINUTES_DRAFT_SAVED",
      office: input.office,
      entityType: "MeetingMinutes",
      entityId: minutes.id,
      details: { meetingId: input.meetingId, attendanceCount: input.attendance.length },
      occurredAt: new Date().toISOString(),
    }, tx);
    return minutes;
}

export async function submitMinutesAndCreateApproval(input: {
  meetingId: string;
  office: OfficeSlug;
  content: string;
  attendance: string[];
  agendaItems: MinutesActionItem[];
}) {
  const result = await db.$transaction(async (tx) => {
    const minutes = await saveMinutesDraftInTransaction(tx, { ...input, submit: true });
    const approval = await createApprovalRequestInTransaction(tx, {
      type: "MINUTES_APPROVAL",
      payload: { minutesId: minutes.id, title: "Approve meeting minutes" },
      makerOffice: input.office,
    });
    return { minutes, request: approval.request, approvers: approval.approvers };
  });
  await notifyApprovalRequestApprovers("MINUTES_APPROVAL", result.approvers);
  return { minutes: result.minutes, approval: result.request };
}

export async function getPublishedDecisionDigests() {
  const now = new Date();
  await db.decisionDigest.updateMany({
    where: { publishedAt: null, publishAt: { lte: now } },
    data: { publishedAt: now },
  });
  return db.decisionDigest.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    take: 100,
  });
}

export async function getPublishedDecisionDigest(id: string) {
  const now = new Date();
  await db.decisionDigest.updateMany({
    where: { id, publishedAt: null, publishAt: { lte: now } },
    data: { publishedAt: now },
  });
  return db.decisionDigest.findFirst({ where: { id, publishedAt: { not: null } } });
}
