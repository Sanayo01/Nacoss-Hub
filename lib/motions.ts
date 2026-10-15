import { db } from "@/lib/db";
import { appendAuditLog } from "@/lib/audit";
import type { OfficeSlug } from "@/lib/admin-auth";

export async function createMotion(input: {
  meetingId: string;
  title: string;
  description: string;
  quorumPercent: number;
  createdBy: OfficeSlug;
}) {
  if (input.quorumPercent < 1 || input.quorumPercent > 100) throw new Error("Quorum must be between 1 and 100");
  return db.$transaction(async (tx) => {
    const meeting = await tx.meeting.findUnique({ where: { id: input.meetingId } });
    if (!meeting) throw new Error("Meeting not found");
    const motion = await tx.motion.create({ data: input });
    await appendAuditLog({
      action: "MOTION_CREATED",
      office: input.createdBy,
      entityType: "Motion",
      entityId: motion.id,
      details: { title: motion.title, meetingId: motion.meetingId, quorumPercent: motion.quorumPercent },
      occurredAt: new Date().toISOString(),
    }, tx);
    return motion;
  });
}

export async function getMotions() {
  return db.motion.findMany({
    include: { votes: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function castMotionVote(input: {
  motionId: string;
  office: OfficeSlug;
  vote: "FOR" | "AGAINST" | "ABSTAIN";
}) {
  return db.$transaction(async (tx) => {
    const motion = await tx.motion.findUnique({ where: { id: input.motionId } });
    if (!motion || motion.status !== "OPEN") throw new Error("Motion is not open for voting");
    const result = await tx.motionVote.upsert({
      where: { motionId_office: { motionId: input.motionId, office: input.office } },
      create: { motionId: input.motionId, office: input.office, vote: input.vote },
      update: { vote: input.vote },
    });
    await appendAuditLog({
      action: "MOTION_VOTE_CAST",
      office: input.office,
      entityType: "Motion",
      entityId: motion.id,
      details: { vote: input.vote },
      occurredAt: new Date().toISOString(),
    }, tx);
    return result;
  });
}

export async function closeMotion(motionId: string, office: OfficeSlug) {
  return db.$transaction(async (tx) => {
    const motion = await tx.motion.findUnique({ where: { id: motionId }, include: { votes: true } });
    if (!motion || motion.status !== "OPEN") throw new Error("Motion is not open");
    const quorum = Math.ceil(11 * motion.quorumPercent / 100);
    const participated = motion.votes.length;
    const forVotes = motion.votes.filter((item) => item.vote === "FOR").length;
    const againstVotes = motion.votes.filter((item) => item.vote === "AGAINST").length;
    const result = participated < quorum ? "NO_QUORUM" : forVotes > againstVotes ? "PASSED" : "FAILED";
    const updated = await tx.motion.update({
      where: { id: motionId },
      data: { status: "CLOSED", result, closedAt: new Date() },
    });
    const minutes = await tx.meetingMinutes.findUnique({ where: { meetingId: motion.meetingId } });
    if (minutes?.status === "LOCKED") {
      throw new Error("Minutes are locked; motions must be closed before minutes approval");
    }
    const item = {
      decision: `Motion: ${motion.title} — ${result}`,
      why: `${forVotes} For, ${againstVotes} Against, ${motion.votes.length - forVotes - againstVotes} Abstain; quorum ${quorum}. ${motion.description}`,
      ownerOffice: office,
      deadline: "",
      shareable: true,
    };
    if (minutes) {
      const items = JSON.parse(minutes.agendaItems) as Array<typeof item>;
      items.push(item);
      await tx.meetingMinutes.update({
        where: { id: minutes.id },
        data: { agendaItems: JSON.stringify(items) },
      });
    } else {
      await tx.meetingMinutes.create({
        data: {
          meetingId: motion.meetingId,
          content: "",
          attendance: "[]",
          agendaItems: JSON.stringify([item]),
          draftedBy: office,
          status: "DRAFT",
        },
      });
    }
    await appendAuditLog({
      action: "MOTION_CLOSED",
      office,
      entityType: "Motion",
      entityId: motion.id,
      details: { result, forVotes, againstVotes, quorum, participated },
      occurredAt: new Date().toISOString(),
    }, tx);
    return updated;
  });
}
