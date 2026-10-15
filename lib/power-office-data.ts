import { db } from "@/lib/db";
import { appendAuditLog } from "@/lib/audit";
import { EXECUTIVES_LIST } from "@/config/executives";
import type { OfficeSlug } from "@/lib/admin-auth";

export async function createDelegation(input: {
  grantingOffice: "president" | "general-secretary";
  delegateOffice: "vice-president" | "assistant-general-secretary";
  startsAt: Date;
  endsAt: Date;
  grantedBy: OfficeSlug;
}) {
  const now = new Date();
  if (!Number.isFinite(input.startsAt.getTime()) || !Number.isFinite(input.endsAt.getTime()) || input.endsAt <= input.startsAt) {
    throw new Error("Delegation dates are invalid");
  }
  if (input.endsAt <= now) throw new Error("Delegation end date must be in the future");
  if (
    (input.grantingOffice === "president" && input.delegateOffice !== "vice-president") ||
    (input.grantingOffice === "general-secretary" && input.delegateOffice !== "assistant-general-secretary")
  ) throw new Error("Only the matching deputy office may receive this delegation");

  return db.$transaction(async (tx) => {
    const delegation = await tx.delegation.create({
      data: {
        ...input,
        status: input.startsAt <= now ? "ACTIVE" : "SCHEDULED",
      },
    });
    await tx.notification.create({
      data: {
        office: input.delegateOffice,
        title: "Delegated approval powers",
        message: `${input.grantingOffice} delegation starts ${input.startsAt.toLocaleString()} and ends ${input.endsAt.toLocaleString()}.`,
        link: "/office",
        kind: "DELEGATION",
      },
    });
    await appendAuditLog({
      action: "OFFICE_POWERS_DELEGATED",
      office: input.grantedBy,
      entityType: "Delegation",
      entityId: delegation.id,
      details: { grantingOffice: input.grantingOffice, delegateOffice: input.delegateOffice, startsAt: input.startsAt.toISOString(), endsAt: input.endsAt.toISOString() },
      occurredAt: now.toISOString(),
    }, tx);
    return delegation;
  });
}

export async function getDelegations(grantingOffice?: string) {
  await updateDelegationStatuses();
  return db.delegation.findMany({
    where: grantingOffice ? { grantingOffice } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function updateDelegationStatuses(now = new Date(), delegationId?: string) {
  const started = await db.delegation.findMany({
    where: { ...(delegationId ? { id: delegationId } : {}), status: "SCHEDULED", startsAt: { lte: now }, endsAt: { gt: now } },
  });
  for (const item of started) {
    await db.$transaction(async (tx) => {
      const result = await tx.delegation.updateMany({
        where: { id: item.id, status: "SCHEDULED" },
        data: { status: "ACTIVE" },
      });
      if (result.count) await appendAuditLog({
        action: "DELEGATION_STARTED",
        office: item.grantingOffice as OfficeSlug,
        entityType: "Delegation",
        entityId: item.id,
        occurredAt: now.toISOString(),
      }, tx);
    });
  }
  const ended = await db.delegation.findMany({
    where: { ...(delegationId ? { id: delegationId } : {}), status: "ACTIVE", endsAt: { lte: now } },
  });
  for (const item of ended) {
    await db.$transaction(async (tx) => {
      const result = await tx.delegation.updateMany({
        where: { id: item.id, status: "ACTIVE" },
        data: { status: "EXPIRED" },
      });
      if (result.count) await appendAuditLog({
        action: "DELEGATION_ENDED",
        office: item.grantingOffice as OfficeSlug,
        entityType: "Delegation",
        entityId: item.id,
        occurredAt: now.toISOString(),
      }, tx);
    });
  }
}

export async function getExecutiveScorecard() {
  const now = new Date();
  return Promise.all(EXECUTIVES_LIST.map(async ({ officeSlug, position }) => {
    const [concerns, tasksDone, tasksOverdue, attendance, reports] = await Promise.all([
      db.concern.findMany({
        where: { targetOfficeSlug: officeSlug, status: "RESOLVED" },
        select: { createdAt: true, updatedAt: true },
      }),
      db.task.count({ where: { assignedToOffice: officeSlug, status: "DONE" } }),
      db.task.count({ where: { assignedToOffice: officeSlug, status: { not: "DONE" }, dueDate: { lt: now } } }),
      db.meetingRSVP.count({ where: { office: officeSlug, response: "ATTENDING" } }),
      db.executiveReport.count({ where: { office: officeSlug } }),
    ]);
    const responseHours = concerns.length
      ? concerns.reduce((total, concern) => total + (concern.updatedAt.getTime() - concern.createdAt.getTime()) / 3600000, 0) / concerns.length
      : null;
    return { office: officeSlug, position, resolvedConcerns: concerns.length, averageResponseHours: responseHours, tasksDone, tasksOverdue, attendance, reportsSubmitted: reports };
  }));
}

export async function createCommittee(input: { name: string; description: string; createdBy: OfficeSlug; members: OfficeSlug[] }) {
  return db.$transaction(async (tx) => {
    const committee = await tx.committee.create({
      data: {
        name: input.name,
        description: input.description,
        createdBy: input.createdBy,
        members: { create: [...new Set(input.members)].map((office) => ({ office })) },
      },
      include: { members: true },
    });
    await appendAuditLog({
      action: "COMMITTEE_CREATED",
      office: input.createdBy,
      entityType: "Committee",
      entityId: committee.id,
      details: { name: committee.name, members: committee.members.map((member) => member.office) },
      occurredAt: new Date().toISOString(),
    }, tx);
    return committee;
  });
}

export async function getCommittees() {
  return db.committee.findMany({ include: { members: true }, orderBy: { createdAt: "desc" } });
}

export async function getCoordinationBoard() {
  const now = new Date();
  const [tasks, meetings] = await Promise.all([
    db.task.findMany({ where: { status: { not: "DONE" } }, orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }] }),
    db.meeting.findMany({ where: { date: { gte: now } }, orderBy: { date: "asc" }, take: 100 }),
  ]);
  return EXECUTIVES_LIST.map(({ officeSlug, position }) => ({
    office: officeSlug,
    position,
    tasks: tasks.filter((task) => task.assignedToOffice === officeSlug),
    meetings: meetings.filter((meeting) => meeting.createdBy === officeSlug),
  }));
}
