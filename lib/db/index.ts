import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Executive Queries
export async function getExecutives() {
  return db.executive.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getExecutiveBySlug(slug: string) {
  return db.executive.findUnique({
    where: { officeSlug: slug },
  });
}

// Concern Queries
export async function createConcern(data: {
  trackingId: string;
  category: string;
  subject: string;
  message: string;
  isAnonymous: boolean;
  senderName?: string | null;
  senderEmail?: string | null;
  level?: string | null;
  targetOfficeSlug: string;
}) {
  return db.concern.create({
    data: {
      ...data,
      status: "RECEIVED",
      updates: {
        create: {
          status: "RECEIVED",
          note: "Concern submitted and assigned to target office.",
        },
      },
    },
    include: {
      updates: true,
    },
  });
}

export async function getConcernByTrackingId(trackingId: string) {
  return db.concern.findUnique({
    where: { trackingId },
    include: {
      updates: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getPublicConcernTracking(trackingId: string) {
  const concern = await db.concern.findUnique({
    where: { trackingId },
    select: {
      trackingId: true,
      category: true,
      status: true,
      publicResponse: true,
      targetOfficeSlug: true,
      createdAt: true,
      updatedAt: true,
      updates: {
        select: {
          id: true,
          status: true,
          note: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  return concern;
}

// Announcements Queries
export async function getAnnouncements() {
  return db.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });
}

export async function getAnnouncementById(id: string) {
  return db.announcement.findUnique({
    where: { id },
  });
}

export async function incrementAnnouncementView(id: string) {
  return db.announcement.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
}

// Calendar Events Queries
export async function getCalendarEvents() {
  return db.calendarEvent.findMany({
    orderBy: { startsAt: "asc" },
  });
}

// Documents Queries
export async function getDocuments() {
  return db.document.findMany({
    orderBy: { title: "asc" },
  });
}

// SIWES Placements Queries
export async function getApprovedSiwesPlacements() {
  return db.siwesPlacement.findMany({
    where: { isApproved: true, consentGiven: true },
    select: {
      id: true,
      studentName: true,
      level: true,
      company: true,
      role: true,
      techStack: true,
      city: true,
      startDate: true,
      endDate: true,
      howIGotIn: true,
      tipsToApply: true,
      contactPreference: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllSiwesPlacements() {
  return db.siwesPlacement.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createSiwesPlacement(data: {
  studentName: string;
  level: string;
  company: string;
  role: string;
  techStack: string;
  city: string;
  startDate?: string | null;
  endDate?: string | null;
  howIGotIn?: string | null;
  tipsToApply: string;
  contactPreference?: string;
  consentGiven: boolean;
}) {
  return db.siwesPlacement.create({
    data: {
      ...data,
      contactPreference: data.contactPreference || "none",
      isApproved: false,
    },
  });
}

export async function updateSiwesPlacementApproval(id: string, isApproved: boolean) {
  return db.siwesPlacement.update({
    where: { id },
    data: { isApproved },
  });
}

export async function deleteSiwesPlacement(id: string) {
  return db.siwesPlacement.delete({
    where: { id },
  });
}

// Alumni Queries
export async function getApprovedAlumni() {
  return db.alumnus.findMany({
    where: { isApproved: true, consentGiven: true },
    select: {
      id: true,
      name: true,
      graduationYear: true,
      currentCompany: true,
      currentRole: true,
      city: true,
      techStack: true,
      advice: true,
      linkedinUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllAlumni() {
  return db.alumnus.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createAlumnus(data: {
  name: string;
  graduationYear: string;
  currentCompany: string;
  currentRole: string;
  city: string;
  techStack: string;
  advice: string;
  linkedinUrl?: string | null;
  consentGiven: boolean;
}) {
  return db.alumnus.create({
    data: {
      ...data,
      isApproved: false,
    },
  });
}

export async function updateAlumnusApproval(id: string, isApproved: boolean) {
  return db.alumnus.update({
    where: { id },
    data: { isApproved },
  });
}

export async function deleteAlumnus(id: string) {
  return db.alumnus.delete({
    where: { id },
  });
}

// SIWES Check-In Queries
export async function createSiwesCheckIn(data: {
  studentName: string;
  level: string;
  company: string;
  status: string;
  notes?: string | null;
  needsHelp?: boolean;
}) {
  return db.siwesCheckIn.create({
    data,
  });
}

export async function getSiwesCheckIns() {
  return db.siwesCheckIn.findMany({
    orderBy: { createdAt: "desc" },
  });
}

// Removal / Edit Requests
export async function createRemovalRequest(data: {
  targetType: string;
  targetId: string;
  reason: string;
  requesterEmail?: string | null;
}) {
  return db.removalRequest.create({
    data,
  });
}

export async function getRemovalRequests() {
  return db.removalRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function updateRemovalRequestResolved(id: string, isResolved: boolean) {
  return db.removalRequest.update({
    where: { id },
    data: { isResolved },
  });
}

// Admin Concern Management Queries
export async function getAdminConcerns(filter?: { office?: string; status?: string }) {
  const where: any = {};
  if (filter?.office && filter.office !== "all") {
    where.targetOfficeSlug = filter.office;
  }
  if (filter?.status && filter.status !== "all") {
    where.status = filter.status;
  }

  const concerns = await db.concern.findMany({
    where,
    include: {
      updates: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return concerns.map((concern) => concern.isAnonymous
    ? { ...concern, senderName: null, senderEmail: null }
    : concern);
}

export async function updateConcernStatusAndResponse(data: {
  concernId: string;
  status: string;
  publicResponse?: string | null;
  updateNote: string;
}) {
  return db.$transaction(async (tx) => {
    const updatedConcern = await tx.concern.update({
      where: { id: data.concernId },
      data: {
        status: data.status,
        ...(data.publicResponse !== undefined && { publicResponse: data.publicResponse }),
      },
    });

    const updateLog = await tx.concernUpdate.create({
      data: {
        concernId: data.concernId,
        status: data.status,
        note: data.updateNote,
      },
    });

    return { updatedConcern, updateLog };
  });
}

// Announcement Creation
export async function createAnnouncement(data: {
  title: string;
  body: string;
  category: string;
  pinned: boolean;
  authorOfficeSlug: string;
}) {
  return db.announcement.create({
    data,
  });
}

// Pulse Poll Queries
export async function getActivePulsePoll() {
  const poll = await db.pulsePoll.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      votes: true,
    },
  });
  return poll;
}

export async function getAllPulsePolls() {
  return db.pulsePoll.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      votes: true,
    },
  });
}

export async function submitPulseVote(pollId: string, option: string) {
  return db.pulseVote.create({
    data: {
      pollId,
      option,
    },
  });
}

// Dashboard / Stats Queries
export async function getPlatformStats() {
  const totalConcerns = await db.concern.count();
  const resolvedConcerns = await db.concern.count({
    where: { status: "RESOLVED" },
  });
  const activeSiwesCount = await db.siwesPlacement.count({
    where: { isApproved: true },
  });
  
  return {
    concernsReceived: totalConcerns,
    concernsResolved: resolvedConcerns,
    medianResponseTime: "< 24 hours",
    activeSiwesCount,
  };
}
