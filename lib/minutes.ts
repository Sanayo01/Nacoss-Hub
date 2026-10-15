import type { Prisma } from "@prisma/client";
import { appendAuditLog } from "@/lib/audit";
import { EXECUTIVES_LIST } from "@/config/executives";
import { db } from "@/lib/db";

type Transaction = Prisma.TransactionClient;

export interface MinutesActionItem {
  decision: string;
  why: string;
  ownerOffice: string;
  deadline: string;
  shareable: boolean;
}

export function buildDecisionDigest(
  title: string,
  items: readonly MinutesActionItem[]
): string {
  return items
    .filter((item) => item.shareable)
    .map((item) => {
      const owner = EXECUTIVES_LIST.find(({ officeSlug }) => officeSlug === item.ownerOffice)?.position ?? item.ownerOffice;
      return `Decision: ${item.decision}\nWhy: ${item.why}\nResponsible: ${owner}${item.deadline ? ` (by ${item.deadline})` : ""}`;
    })
    .join("\n\n");
}

export async function approveMinutesInTransaction(
  tx: Transaction,
  minutesId: string,
  approvedBy: string
) {
  const minutes = await tx.meetingMinutes.findUnique({ where: { id: minutesId } });
  if (!minutes || minutes.status !== "PENDING") throw new Error("Minutes are not awaiting approval");

  const items = JSON.parse(minutes.agendaItems) as MinutesActionItem[];
  for (const item of items) {
    if (!item.decision.trim() || !item.ownerOffice) continue;
    const ownerValid = EXECUTIVES_LIST.some(({ officeSlug }) => officeSlug === item.ownerOffice);
    if (!ownerValid) throw new Error(`Unknown action-item owner office: ${item.ownerOffice}`);
    const dueDate = item.deadline ? new Date(item.deadline) : null;
    if (dueDate && !Number.isFinite(dueDate.getTime())) throw new Error("Invalid action-item deadline");
    const task = await tx.task.create({
      data: {
        title: item.decision.trim(),
        description: item.why.trim(),
        assignedByOffice: approvedBy,
        assignedToOffice: item.ownerOffice,
        dueDate,
        linkedMeetingId: minutes.meetingId,
      },
    });
    await tx.notification.create({
      data: {
        office: item.ownerOffice,
        title: "Meeting action item assigned",
        message: task.title,
        link: "/office/tasks",
        kind: "TASK",
      },
    });
  }

  const updated = await tx.meetingMinutes.update({
    where: { id: minutes.id },
    data: { status: "LOCKED", approvedBy, approvedAt: new Date(), lockedAt: new Date() },
  });
  const meeting = await tx.meeting.findUnique({ where: { id: minutes.meetingId } });
  const digestContent = buildDecisionDigest(meeting?.title ?? "Executive meeting decisions", items);
  const delayHours = Number(process.env.DECISION_DIGEST_PUBLISH_DELAY_HOURS ?? 0);
  const configuredDelay = Number.isFinite(delayHours) && delayHours >= 0 ? delayHours : 0;
  const publishAt = new Date(Date.now() + configuredDelay * 60 * 60 * 1000);
  const digest = await tx.decisionDigest.create({
    data: {
      minutesId: minutes.id,
      meetingId: minutes.meetingId,
      title: `Decision Digest: ${meeting?.title ?? "Executive meeting"}`,
      content: digestContent,
      publishAt,
      publishedAt: configuredDelay === 0 ? new Date() : null,
    },
  });
  await appendAuditLog({
    action: "MINUTES_APPROVED_AND_LOCKED",
    office: approvedBy as "general-secretary",
    entityType: "MeetingMinutes",
    entityId: minutes.id,
    details: { tasksCreated: items.filter((item) => item.decision.trim() && item.ownerOffice).length, digestId: digest.id },
    occurredAt: new Date().toISOString(),
  }, tx);
  return { minutes: updated, digest };
}

export async function publishDueDecisionDigests() {
  const now = new Date();
  const result = await db.decisionDigest.updateMany({
    where: { publishedAt: null, publishAt: { lte: now } },
    data: { publishedAt: now },
  });
  return result.count;
}
