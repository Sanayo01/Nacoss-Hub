import { db } from "@/lib/db";
import { EXECUTIVES_LIST } from "@/config/executives";
import { appendAuditLog } from "@/lib/audit";
import type { OfficeSlug } from "@/lib/admin-auth";
import { sendOfficeNotification } from "@/lib/mailer";

export async function getOfficeDay(office: OfficeSlug, actingFor?: OfficeSlug) {
  await sendDueMeetingReminders();
  const now = new Date();
  const [meetings, tasks, approvals, concerns, notifications] = await Promise.all([
    db.meeting.findMany({
      where: { date: { gte: now } },
      include: { rsvps: true },
      orderBy: { date: "asc" },
      take: 5,
    }),
    db.task.findMany({
      where: { assignedToOffice: office, status: { not: "DONE" } },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      take: 10,
    }),
    db.approvalRequest.findMany({
      where: { status: "PENDING", expiresAt: { gt: now } },
      include: { decisions: true },
      orderBy: { createdAt: "desc" },
    }),
    db.concern.findMany({
      where: { targetOfficeSlug: office, status: { in: ["RECEIVED", "BEING_HANDLED"] } },
      select: {
        id: true,
        trackingId: true,
        category: true,
        subject: true,
        status: true,
        isAnonymous: true,
        senderName: true,
        senderEmail: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.notification.findMany({
      where: { office, scheduledAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    meetings: meetings.map((meeting) => ({
      ...meeting,
      myRsvp: meeting.rsvps.find((rsvp) => rsvp.office === office)?.response ?? null,
    })),
    tasks: tasks.map((task) => ({ ...task, overdue: Boolean(task.dueDate && task.dueDate < now) })),
    approvals: approvals.filter((request) => {
      const requiredApprovers = JSON.parse(request.requiredApprovers) as string[];
      const eligible = requiredApprovers.includes(office) || Boolean(actingFor && requiredApprovers.includes(actingFor));
      return eligible && !request.decisions.some((decision) =>
        decision.office === office || Boolean(actingFor && (decision.office === actingFor || decision.actingFor === actingFor))
      );
    }),
    concerns: concerns.map((concern) => concern.isAnonymous
      ? { ...concern, senderName: null, senderEmail: null }
      : concern),
    notifications,
  };
}

export async function getOfficeMeetings(office: OfficeSlug) {
  return db.meeting.findMany({
    include: { rsvps: true },
    orderBy: { date: "asc" },
    take: 100,
  }).then((meetings) => meetings.map((meeting) => ({
    ...meeting,
    myRsvp: meeting.rsvps.find((rsvp) => rsvp.office === office)?.response ?? null,
  })));
}

export async function createOfficeMeeting(input: {
  title: string;
  date: Date;
  venue: string;
  agenda: string;
  mandatory: boolean;
  createdBy: OfficeSlug;
}) {
  const reminderAt = new Date(input.date.getTime() - 48 * 60 * 60 * 1000);
  const meeting = await db.$transaction(async (tx) => {
    const meeting = await tx.meeting.create({
      data: {
        ...input,
        reminderAt,
        rsvps: { create: EXECUTIVES_LIST.map(({ officeSlug }) => ({ office: officeSlug })) },
      },
    });
    const offices = EXECUTIVES_LIST.map(({ officeSlug }) => officeSlug);
    await tx.notification.createMany({
      data: offices.map((office) => ({
        office,
        title: "New executive meeting",
        message: `${input.title} — ${input.date.toLocaleString()}`,
        link: "/office/meetings",
        kind: "MEETING",
      })),
    });
    await appendAuditLog({
      action: "MEETING_CREATED",
      office: input.createdBy,
      entityType: "Meeting",
      entityId: meeting.id,
      details: { title: meeting.title, date: meeting.date.toISOString() },
      occurredAt: new Date().toISOString(),
    }, tx);
    return meeting;
  });
  const sentRecipients = new Set<string>();
  for (const { officeSlug } of EXECUTIVES_LIST) {
    const officeEmail = EXECUTIVES_LIST.find((executive) => executive.officeSlug === officeSlug)?.officeEmail;
    const recipient = process.env.TEST_MODE !== "false" && officeEmail?.endsWith("@nacos-unilag.example")
      ? "sanayodeji087@gmail.com"
      : officeEmail;
    if (recipient && !sentRecipients.has(recipient)) {
      sentRecipients.add(recipient);
      await sendOfficeNotification(officeSlug, "New executive meeting", `${input.title} — ${input.date.toLocaleString()}`);
    }
  }
  return meeting;
}

export async function respondToMeeting(meetingId: string, office: OfficeSlug, response: "ATTENDING" | "APOLOGIES") {
  return db.$transaction(async (tx) => {
    const rsvp = await tx.meetingRSVP.upsert({
      where: { meetingId_office: { meetingId, office } },
      create: { meetingId, office, response },
      update: { response },
    });
    await appendAuditLog({
      action: "MEETING_RSVP_UPDATED",
      office,
      entityType: "Meeting",
      entityId: meetingId,
      details: { response },
      occurredAt: new Date().toISOString(),
    }, tx);
    return rsvp;
  });
}

export async function getOfficeTasks(office: OfficeSlug) {
  const now = new Date();
  const tasks = await db.task.findMany({
    where: { OR: [{ assignedToOffice: office }, { assignedByOffice: office }] },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });
  return tasks.map((task) => ({ ...task, overdue: Boolean(task.dueDate && task.dueDate < now && task.status !== "DONE") }));
}

export async function createOfficeTask(input: {
  title: string;
  description: string;
  assignedByOffice: OfficeSlug;
  assignedToOffice: OfficeSlug;
  dueDate: Date | null;
  linkedMeetingId?: string | null;
  linkedActionItem?: string | null;
}) {
  const task = await db.$transaction(async (tx) => {
    const task = await tx.task.create({ data: input });
    await tx.notification.create({
      data: {
        office: input.assignedToOffice,
        title: "Task assigned",
        message: input.title,
        link: "/office/tasks",
        kind: "TASK",
      },
    });
    await appendAuditLog({
      action: "TASK_CREATED",
      office: input.assignedByOffice,
      entityType: "Task",
      entityId: task.id,
      details: { assignedToOffice: input.assignedToOffice, title: input.title },
      occurredAt: new Date().toISOString(),
    }, tx);
    return task;
  });
  await sendOfficeNotification(input.assignedToOffice, "Task assigned", input.title);
  return task;
}

export async function updateOfficeTask(input: {
  id: string;
  office: OfficeSlug;
  status: "OPEN" | "IN_PROGRESS" | "DONE";
}) {
  return db.$transaction(async (tx) => {
    const task = await tx.task.findUnique({ where: { id: input.id } });
    if (!task || (task.assignedToOffice !== input.office && task.assignedByOffice !== input.office)) {
      throw new Error("Task not found for this office");
    }
    const updated = await tx.task.update({ where: { id: input.id }, data: { status: input.status } });
    await appendAuditLog({
      action: "TASK_UPDATED",
      office: input.office,
      entityType: "Task",
      entityId: updated.id,
      details: { status: updated.status },
      occurredAt: new Date().toISOString(),
    }, tx);
    return updated;
  });
}

export async function getOfficeNotifications(office: OfficeSlug) {
  return db.notification.findMany({
    where: { office, scheduledAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function markNotificationRead(id: string, office: OfficeSlug) {
  return db.$transaction(async (tx) => {
    const result = await tx.notification.updateMany({
      where: { id, office, readAt: null },
      data: { readAt: new Date() },
    });
    if (result.count) {
      await appendAuditLog({
        action: "NOTIFICATION_READ",
        office,
        entityType: "Notification",
        entityId: id,
        occurredAt: new Date().toISOString(),
      }, tx);
    }
    return result;
  });
}

export async function sendDueMeetingReminders() {
  const now = new Date();
  const dueMeetings = await db.meeting.findMany({
    where: { reminderAt: { lte: now }, reminderSentAt: null, date: { gt: now } },
    orderBy: { reminderAt: "asc" },
  });
  const sent: string[] = [];
  for (const meeting of dueMeetings) {
    const offices = EXECUTIVES_LIST.map(({ officeSlug }) => officeSlug);
    const marked = await db.$transaction(async (tx) => {
      const result = await tx.meeting.updateMany({
        where: { id: meeting.id, reminderSentAt: null },
        data: { reminderSentAt: now },
      });
      if (!result.count) return false;
      await tx.notification.createMany({
        data: offices.map((office) => ({
          office,
          title: "Meeting in 48 hours",
          message: `${meeting.title}: ${meeting.agenda}`,
          link: "/office/meetings",
          kind: "MEETING_REMINDER",
        })),
      });
      await appendAuditLog({
        action: "MEETING_REMINDER_SENT",
        office: "system",
        entityType: "Meeting",
        entityId: meeting.id,
        occurredAt: now.toISOString(),
      }, tx);
      return true;
    });
    if (marked) {
      const recipients = new Set<string>();
      for (const office of offices) {
        const executive = EXECUTIVES_LIST.find((item) => item.officeSlug === office);
        if (!executive) continue;
        const recipient = process.env.TEST_MODE !== "false" &&
          executive.officeEmail.endsWith("@nacos-unilag.example")
          ? "sanayodeji087@gmail.com"
          : executive.officeEmail;
        if (!recipients.has(recipient)) {
          recipients.add(recipient);
          await sendOfficeNotification(
            office,
            "Meeting in 48 hours",
            `${meeting.title}: ${meeting.agenda}`
          );
        }
      }
      sent.push(meeting.id);
    }
  }
  return sent;
}
