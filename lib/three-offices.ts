import { db } from "@/lib/db";
import { appendAuditLog } from "@/lib/audit";
import { createApprovalRequestInTransaction, notifyApprovalRequestApprovers } from "@/lib/approvals";
import type { OfficeSlug } from "@/lib/admin-auth";

export async function checkOfficeDatabase() {
  await db.$queryRaw`SELECT 1`;
  return true;
}

export async function getMediaAsset(id: string) {
  return db.mediaAsset.findUnique({ where: { id } });
}

export async function getSocialEventForTask(id: string) {
  return db.socialEvent.findFirst({ where: { id, status: "APPROVED" }, select: { id: true, title: true } });
}

export async function createAnnouncementDraft(input: {
  title: string;
  body: string;
  category: string;
  pinned: boolean;
  official: boolean;
  submit: boolean;
  office: OfficeSlug;
}) {
  const created = await db.$transaction(async (tx) => {
    const draft = await tx.announcementDraft.create({
      data: {
        title: input.title,
        body: input.body,
        category: input.category,
        pinned: input.pinned,
        official: input.official,
        createdBy: input.office,
      },
    });
    if (!input.submit) {
      await appendAuditLog({
        action: "ANNOUNCEMENT_DRAFT_CREATED", office: input.office,
        entityType: "AnnouncementDraft", entityId: draft.id,
        details: { category: draft.category }, occurredAt: new Date().toISOString(),
      }, tx);
      return { draft, approvers: [] as OfficeSlug[] };
    }
    const type = input.category === "Urgent" ? "URGENT_ANNOUNCEMENT" : "OFFICIAL_ANNOUNCEMENT";
    const approval = await createApprovalRequestInTransaction(tx, {
      type,
      makerOffice: input.office,
      payload: {
        title: draft.title, body: draft.body, category: draft.category, pinned: draft.pinned,
        draftId: draft.id,
      },
    });
    const updatedDraft = await tx.announcementDraft.update({
      where: { id: draft.id },
      data: { status: "PENDING", approvalRequestId: approval.request.id },
    });
    await appendAuditLog({
      action: "ANNOUNCEMENT_SUBMITTED_FOR_APPROVAL", office: input.office,
      entityType: "AnnouncementDraft", entityId: draft.id,
      details: { approvalRequestId: approval.request.id }, occurredAt: new Date().toISOString(),
    }, tx);
    return { draft: updatedDraft, approvers: approval.approvers };
  });
  if (created.approvers.length) {
    await notifyApprovalRequestApprovers(
      input.category === "Urgent" ? "URGENT_ANNOUNCEMENT" : "OFFICIAL_ANNOUNCEMENT",
      created.approvers,
    );
  }
  return created.draft;
}

export async function listProStudio() {
  const [drafts, published, calendar, assets, coverage] = await Promise.all([
    db.announcementDraft.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    db.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    db.contentCalendarItem.findMany({ orderBy: { scheduledAt: "asc" }, take: 100 }),
    db.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    db.task.findMany({ where: { linkedActionItem: { startsWith: "PRO_COVERAGE:" } }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return { drafts, published, calendar, assets, coverage };
}

export async function createContentCalendarItem(input: {
  title: string; channel: string; scheduledAt: Date; notes: string; office: OfficeSlug;
}) {
  return db.$transaction(async (tx) => {
    const item = await tx.contentCalendarItem.create({
      data: { title: input.title, channel: input.channel, scheduledAt: input.scheduledAt, notes: input.notes, createdBy: input.office },
    });
    await appendAuditLog({
      action: "CONTENT_CALENDAR_ITEM_CREATED", office: input.office,
      entityType: "ContentCalendarItem", entityId: item.id,
      details: { title: item.title, scheduledAt: item.scheduledAt.toISOString() }, occurredAt: new Date().toISOString(),
    }, tx);
    return item;
  });
}

export async function createMediaAsset(input: {
  title: string; description: string; filePath: string; fileName: string; mimeType: string; size: number; office: OfficeSlug;
}) {
  return db.$transaction(async (tx) => {
    const asset = await tx.mediaAsset.create({
      data: {
        title: input.title, description: input.description, filePath: input.filePath,
        fileName: input.fileName, mimeType: input.mimeType, size: input.size, createdBy: input.office,
      },
    });
    await appendAuditLog({
      action: "MEDIA_ASSET_UPLOADED", office: input.office,
      entityType: "MediaAsset", entityId: asset.id,
      details: { fileName: asset.fileName, size: asset.size }, occurredAt: new Date().toISOString(),
    }, tx);
    return asset;
  });
}

export async function listSoftwareBoard() {
  const [requests, developers, releases] = await Promise.all([
    db.platformRequest.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    db.developerVolunteer.findMany({ orderBy: { createdAt: "desc" } }),
    db.releaseNote.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return { requests, developers, releases };
}

export async function submitPlatformRequest(input: {
  kind: "BUG" | "FEATURE"; title: string; description: string; office?: OfficeSlug;
}) {
  return db.$transaction(async (tx) => {
    const request = await tx.platformRequest.create({
      data: { kind: input.kind, title: input.title, description: input.description, requesterOffice: input.office ?? null },
    });
    await appendAuditLog({
      action: "PLATFORM_REQUEST_SUBMITTED", office: input.office ?? "system",
      entityType: "PlatformRequest", entityId: request.id,
      details: { kind: request.kind, title: request.title, source: input.office ? "executive" : "student" },
      occurredAt: new Date().toISOString(),
    }, tx);
    return request;
  });
}

export async function updatePlatformRequest(input: { id: string; status: "OPEN" | "IN_PROGRESS" | "DONE" | "DECLINED"; office: OfficeSlug }) {
  return db.$transaction(async (tx) => {
    const current = await tx.platformRequest.findUnique({ where: { id: input.id } });
    if (!current) throw new Error("Platform request not found.");
    if (current.kind === "TECHNICAL_CHANGE") throw new Error("Technical changes can only be resolved by the two-key approval.");
    const request = await tx.platformRequest.update({ where: { id: input.id }, data: { status: input.status } });
    await appendAuditLog({
      action: "PLATFORM_REQUEST_STATUS_UPDATED", office: input.office,
      entityType: "PlatformRequest", entityId: input.id,
      details: { status: input.status }, occurredAt: new Date().toISOString(),
    }, tx);
    return request;
  });
}

export async function saveDeveloperVolunteer(input: {
  id?: string; name: string; skills: string; availability: string; assignedTask?: string | null; office: OfficeSlug;
}) {
  return db.$transaction(async (tx) => {
    const volunteer = input.id
      ? await tx.developerVolunteer.update({
          where: { id: input.id },
          data: { name: input.name, skills: input.skills, availability: input.availability, assignedTask: input.assignedTask ?? null },
        })
      : await tx.developerVolunteer.create({
          data: { name: input.name, skills: input.skills, availability: input.availability, assignedTask: input.assignedTask ?? null },
        });
    await appendAuditLog({
      action: input.id ? "DEVELOPER_VOLUNTEER_UPDATED" : "DEVELOPER_VOLUNTEER_ADDED",
      office: input.office, entityType: "DeveloperVolunteer", entityId: volunteer.id,
      details: { availability: volunteer.availability, hasAssignedTask: Boolean(volunteer.assignedTask) },
      occurredAt: new Date().toISOString(),
    }, tx);
    return volunteer;
  });
}

export async function createReleaseNote(input: { version: string; title: string; notes: string; published: boolean; office: OfficeSlug }) {
  return db.$transaction(async (tx) => {
    const release = await tx.releaseNote.create({
      data: { version: input.version, title: input.title, notes: input.notes, published: input.published, createdBy: input.office },
    });
    await appendAuditLog({
      action: "RELEASE_NOTE_CREATED", office: input.office,
      entityType: "ReleaseNote", entityId: release.id,
      details: { version: release.version, published: release.published }, occurredAt: new Date().toISOString(),
    }, tx);
    return release;
  });
}

export async function submitTechnicalChange(input: { title: string; description: string; office: OfficeSlug }) {
  const result = await db.$transaction(async (tx) => {
    const request = await tx.platformRequest.create({
      data: { kind: "TECHNICAL_CHANGE", title: input.title, description: input.description, status: "PENDING_APPROVAL", requesterOffice: input.office },
    });
    const approval = await createApprovalRequestInTransaction(tx, {
      type: "ROLE_CHANGE", makerOffice: input.office,
      payload: { platformRequestId: request.id, title: input.title, description: input.description },
    });
    const updated = await tx.platformRequest.update({
      where: { id: request.id }, data: { approvalRequestId: approval.request.id },
    });
    await appendAuditLog({
      action: "TECHNICAL_CHANGE_SUBMITTED_FOR_TWO_KEY_APPROVAL",
      office: input.office,
      entityType: "PlatformRequest",
      entityId: request.id,
      details: { approvalRequestId: approval.request.id, title: request.title },
      occurredAt: new Date().toISOString(),
    }, tx);
    return { request: updated, approvers: approval.approvers };
  });
  await notifyApprovalRequestApprovers("ROLE_CHANGE", result.approvers);
  return result.request;
}

export async function createSocialEvent(input: {
  title: string; description: string; venue: string; startsAt: Date; endsAt: Date;
  budgetRequest: number; checklist: string[]; office: OfficeSlug;
}) {
  const result = await db.$transaction(async (tx) => {
    const event = await tx.socialEvent.create({
      data: {
        title: input.title, description: input.description, venue: input.venue,
        startsAt: input.startsAt, endsAt: input.endsAt, budgetRequest: input.budgetRequest,
        checklist: JSON.stringify(input.checklist), createdBy: input.office,
      },
    });
    const approval = await createApprovalRequestInTransaction(tx, {
      type: "EVENT_BUDGET", makerOffice: input.office,
      payload: { eventId: event.id, title: event.title, amount: event.budgetRequest },
    });
    const updated = await tx.socialEvent.update({
      where: { id: event.id },
      data: { approvalRequestId: approval.request.id, status: "PENDING_APPROVAL" },
    });
    await appendAuditLog({
      action: "SOCIAL_EVENT_SUBMITTED_FOR_APPROVAL", office: input.office,
      entityType: "SocialEvent", entityId: event.id,
      details: { title: event.title, budgetRequest: event.budgetRequest, approvalRequestId: approval.request.id },
      occurredAt: new Date().toISOString(),
    }, tx);
    return { event: updated, approvers: approval.approvers };
  });
  await notifyApprovalRequestApprovers("EVENT_BUDGET", result.approvers);
  return result.event;
}

export async function listPublicSocialEvents() {
  return db.socialEvent.findMany({
    where: { status: "APPROVED", startsAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    include: { _count: { select: { volunteers: true, rsvps: true, feedback: true } } },
    orderBy: { startsAt: "asc" },
  });
}

export async function listSocialEvents() {
  return db.socialEvent.findMany({
    include: {
      volunteers: { orderBy: { createdAt: "desc" } },
      rsvps: true,
      feedback: true,
      _count: { select: { volunteers: true, rsvps: true, feedback: true } },
    },
    orderBy: { startsAt: "desc" }, take: 100,
  });
}

export async function volunteerForEvent(input: { eventId: string; studentName: string; task: string; hoursOptIn: boolean }) {
  return db.$transaction(async (tx) => {
    const event = await tx.socialEvent.findFirst({
      where: { id: input.eventId, status: "APPROVED", startsAt: { gt: new Date() } },
    });
    if (!event) throw new Error("This event is not open for volunteering.");
    const volunteer = await tx.eventVolunteer.create({
      data: { eventId: event.id, studentName: input.studentName, task: input.task, hoursOptIn: input.hoursOptIn },
    });
    await appendAuditLog({
      action: "EVENT_VOLUNTEER_REGISTERED", office: "system",
      entityType: "SocialEvent", entityId: event.id,
      details: { volunteerId: volunteer.id, hoursOptIn: volunteer.hoursOptIn },
      occurredAt: new Date().toISOString(),
    }, tx);
    return volunteer;
  });
}

export async function updateVolunteerHours(input: { id: string; hours: number; office: OfficeSlug }) {
  return db.$transaction(async (tx) => {
    const current = await tx.eventVolunteer.findUnique({ where: { id: input.id } });
    if (!current) throw new Error("Volunteer record not found.");
    if (!current.hoursOptIn) throw new Error("Volunteer did not opt in to recording hours.");
    const volunteer = await tx.eventVolunteer.update({
      where: { id: input.id }, data: { hours: input.hours },
    });
    await appendAuditLog({
      action: "EVENT_VOLUNTEER_HOURS_UPDATED", office: input.office,
      entityType: "EventVolunteer", entityId: volunteer.id,
      details: { eventId: volunteer.eventId, hours: volunteer.hours, hoursOptIn: volunteer.hoursOptIn },
      occurredAt: new Date().toISOString(),
    }, tx);
    return volunteer;
  });
}

export async function updateSocialEvent(input: {
  id: string; report?: string; checklist?: string[]; office: OfficeSlug;
}) {
  return db.$transaction(async (tx) => {
    const event = await tx.socialEvent.update({
      where: { id: input.id },
      data: {
        ...(input.report !== undefined ? { report: input.report } : {}),
        ...(input.checklist !== undefined ? { checklist: JSON.stringify(input.checklist) } : {}),
      },
    });
    await appendAuditLog({
      action: input.report !== undefined ? "SOCIAL_EVENT_REPORT_UPDATED" : "SOCIAL_EVENT_CHECKLIST_UPDATED",
      office: input.office, entityType: "SocialEvent", entityId: event.id,
      details: { hasReport: Boolean(event.report) }, occurredAt: new Date().toISOString(),
    }, tx);
    return event;
  });
}

export async function submitEventRsvp(input: { eventId: string; studentName?: string; response: "ATTENDING" | "APOLOGIES" }) {
  return db.$transaction(async (tx) => {
    const event = await tx.socialEvent.findFirst({
      where: { id: input.eventId, status: "APPROVED", endsAt: { gt: new Date() } },
    });
    if (!event) throw new Error("This event is not available for RSVP.");
    const rsvp = await tx.eventRSVP.create({
      data: { eventId: event.id, studentName: input.studentName || null, response: input.response },
    });
    await appendAuditLog({
      action: "SOCIAL_EVENT_RSVP_SUBMITTED", office: "system",
      entityType: "SocialEvent", entityId: event.id,
      details: { response: rsvp.response }, occurredAt: new Date().toISOString(),
    }, tx);
    return rsvp;
  });
}

export async function submitEventFeedback(input: { eventId: string; rating: number; feedback: string }) {
  return db.$transaction(async (tx) => {
    const event = await tx.socialEvent.findFirst({ where: { id: input.eventId, status: "APPROVED" } });
    if (!event || event.endsAt > new Date()) throw new Error("Feedback is available after the event.");
    const feedback = await tx.eventFeedback.create({ data: input });
    await appendAuditLog({
      action: "SOCIAL_EVENT_FEEDBACK_SUBMITTED", office: "system",
      entityType: "SocialEvent", entityId: event.id,
      details: { feedbackId: feedback.id, rating: feedback.rating }, occurredAt: new Date().toISOString(),
    }, tx);
    return feedback;
  });
}
