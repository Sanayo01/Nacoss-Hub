-- CreateTable
CREATE TABLE "Executive" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Name to be confirmed',
    "position" TEXT NOT NULL,
    "officeSlug" TEXT NOT NULL,
    "photoUrl" TEXT,
    "bio" TEXT NOT NULL,
    "goToThemFor" TEXT NOT NULL,
    "handles" TEXT NOT NULL DEFAULT '[]',
    "officeEmail" TEXT NOT NULL,
    "isListed" BOOLEAN NOT NULL DEFAULT true,
    "emailConsent" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Executive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Concern" (
    "id" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "senderName" TEXT,
    "senderEmail" TEXT,
    "level" TEXT,
    "targetOfficeSlug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "publicResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Concern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConcernUpdate" (
    "id" TEXT NOT NULL,
    "concernId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConcernUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "authorOfficeSlug" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiwesPlacement" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "techStack" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "startDate" TEXT,
    "endDate" TEXT,
    "howIGotIn" TEXT,
    "tipsToApply" TEXT NOT NULL,
    "contactPreference" TEXT NOT NULL DEFAULT 'none',
    "consentGiven" BOOLEAN NOT NULL DEFAULT true,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiwesPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alumnus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "graduationYear" TEXT NOT NULL,
    "currentCompany" TEXT NOT NULL,
    "currentRole" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "techStack" TEXT NOT NULL,
    "advice" TEXT NOT NULL,
    "linkedinUrl" TEXT,
    "consentGiven" BOOLEAN NOT NULL DEFAULT true,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alumnus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiwesCheckIn" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "needsHelp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiwesCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RemovalRequest" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "requesterEmail" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RemovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PulsePoll" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PulsePoll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PulseVote" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "option" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PulseVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "sequence" SERIAL NOT NULL,
    "payload" TEXT NOT NULL,
    "prevHash" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("sequence")
);

-- CreateTable
CREATE TABLE "ApprovalRequest" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "makerOffice" TEXT NOT NULL,
    "requiredApprovers" TEXT NOT NULL,
    "approvalMode" TEXT NOT NULL DEFAULT 'ANY',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "decidedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalDecision" (
    "id" TEXT NOT NULL,
    "approvalRequestId" TEXT NOT NULL,
    "office" TEXT NOT NULL,
    "actingFor" TEXT,
    "decision" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "office" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'INFO',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "assignedByOffice" TEXT NOT NULL,
    "assignedToOffice" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "linkedMeetingId" TEXT,
    "linkedActionItem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,
    "agenda" TEXT NOT NULL,
    "mandatory" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "reminderAt" TIMESTAMP(3),
    "reminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingRSVP" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "office" TEXT NOT NULL,
    "response" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingRSVP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delegation" (
    "id" TEXT NOT NULL,
    "grantingOffice" TEXT NOT NULL,
    "delegateOffice" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "grantedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Delegation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Committee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Committee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommitteeMember" (
    "id" TEXT NOT NULL,
    "committeeId" TEXT NOT NULL,
    "office" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommitteeMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Motion" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quorumPercent" INTEGER NOT NULL DEFAULT 50,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "result" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Motion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MotionVote" (
    "id" TEXT NOT NULL,
    "motionId" TEXT NOT NULL,
    "office" TEXT NOT NULL,
    "vote" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MotionVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingMinutes" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attendance" TEXT NOT NULL,
    "agendaItems" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "draftedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingMinutes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionDigest" (
    "id" TEXT NOT NULL,
    "minutesId" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "publishAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecisionDigest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OversightQuery" (
    "id" TEXT NOT NULL,
    "targetOffice" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "response" TEXT,
    "responseAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OversightQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutiveReport" (
    "id" TEXT NOT NULL,
    "office" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutiveReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScorecardPromise" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "baseline" TEXT,
    "target" TEXT,
    "delivered" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScorecardPromise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "folder" TEXT NOT NULL,
    "session" TEXT NOT NULL,
    "permission" TEXT NOT NULL DEFAULT 'EXECUTIVES',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "filePath" TEXT,
    "driveLink" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeDocumentVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "filePath" TEXT,
    "driveLink" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfficeDocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficialLetter" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "OfficialLetter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LetterSequence" (
    "year" INTEGER NOT NULL,
    "nextValue" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LetterSequence_pkey" PRIMARY KEY ("year")
);

-- CreateTable
CREATE TABLE "AnnouncementDraft" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "official" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "approvalRequestId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnnouncementDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentCalendarItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentCalendarItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformRequest" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "approvalRequestId" TEXT,
    "requesterOffice" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeveloperVolunteer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "availability" TEXT NOT NULL,
    "assignedTask" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeveloperVolunteer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseNote" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReleaseNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "budgetRequest" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "checklist" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvalRequestId" TEXT,
    "calendarEventId" TEXT,
    "createdBy" TEXT NOT NULL,
    "report" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventVolunteer" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "email" TEXT,
    "task" TEXT NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hoursOptIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventVolunteer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRSVP" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "studentName" TEXT,
    "response" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventRSVP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventFeedback" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DuesMember" (
    "id" TEXT NOT NULL,
    "memberCode" TEXT NOT NULL,
    "displayName" TEXT NOT NULL DEFAULT 'Mock member',
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "receiptRef" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DuesMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DuesReminderDraft" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DuesReminderDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceQuery" (
    "id" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "senderName" TEXT,
    "senderEmail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "office" TEXT NOT NULL,
    "event" TEXT,
    "term" TEXT NOT NULL DEFAULT 'CURRENT',
    "amount" DOUBLE PRECISION NOT NULL,
    "receiptRef" TEXT,
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetPlan" (
    "id" TEXT NOT NULL,
    "scopeType" TEXT NOT NULL,
    "scopeName" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "term" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreasuryReceipt" (
    "id" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TreasuryReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenditureRequest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "office" TEXT NOT NULL,
    "event" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "term" TEXT NOT NULL DEFAULT 'CURRENT',
    "requestedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_TREASURER',
    "approvalRequestId" TEXT,
    "receiptRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenditureRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WelfareCase" (
    "id" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "senderName" TEXT,
    "senderEmail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WelfareCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WelfareReferral" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WelfareReferral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WelfareDrive" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WelfareDrive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WellbeingResource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WellbeingResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportsTeam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "roster" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SportsTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportsFixture" (
    "id" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "opponent" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "result" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SportsFixture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "condition" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EquipmentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportsSignup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SportsSignup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportsAchievement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SportsAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Executive_officeSlug_key" ON "Executive"("officeSlug");

-- CreateIndex
CREATE UNIQUE INDEX "Concern_trackingId_key" ON "Concern"("trackingId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditLog_prevHash_key" ON "AuditLog"("prevHash");

-- CreateIndex
CREATE UNIQUE INDEX "AuditLog_hash_key" ON "AuditLog"("hash");

-- CreateIndex
CREATE INDEX "AuditLog_sequence_idx" ON "AuditLog"("sequence");

-- CreateIndex
CREATE INDEX "ApprovalRequest_status_expiresAt_idx" ON "ApprovalRequest"("status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalDecision_approvalRequestId_office_key" ON "ApprovalDecision"("approvalRequestId", "office");

-- CreateIndex
CREATE INDEX "Notification_office_createdAt_idx" ON "Notification"("office", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_scheduledAt_sentAt_idx" ON "Notification"("scheduledAt", "sentAt");

-- CreateIndex
CREATE INDEX "Task_assignedToOffice_status_dueDate_idx" ON "Task"("assignedToOffice", "status", "dueDate");

-- CreateIndex
CREATE INDEX "Meeting_date_idx" ON "Meeting"("date");

-- CreateIndex
CREATE INDEX "MeetingRSVP_office_response_idx" ON "MeetingRSVP"("office", "response");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingRSVP_meetingId_office_key" ON "MeetingRSVP"("meetingId", "office");

-- CreateIndex
CREATE INDEX "Delegation_grantingOffice_delegateOffice_startsAt_endsAt_st_idx" ON "Delegation"("grantingOffice", "delegateOffice", "startsAt", "endsAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Committee_name_key" ON "Committee"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeMember_committeeId_office_key" ON "CommitteeMember"("committeeId", "office");

-- CreateIndex
CREATE INDEX "Motion_meetingId_status_idx" ON "Motion"("meetingId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MotionVote_motionId_office_key" ON "MotionVote"("motionId", "office");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingMinutes_meetingId_key" ON "MeetingMinutes"("meetingId");

-- CreateIndex
CREATE UNIQUE INDEX "DecisionDigest_minutesId_key" ON "DecisionDigest"("minutesId");

-- CreateIndex
CREATE INDEX "DecisionDigest_publishAt_publishedAt_idx" ON "DecisionDigest"("publishAt", "publishedAt");

-- CreateIndex
CREATE INDEX "OversightQuery_targetOffice_status_createdAt_idx" ON "OversightQuery"("targetOffice", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ExecutiveReport_office_submittedAt_idx" ON "ExecutiveReport"("office", "submittedAt");

-- CreateIndex
CREATE INDEX "OfficeDocument_folder_session_permission_idx" ON "OfficeDocument"("folder", "session", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "OfficeDocumentVersion_documentId_version_key" ON "OfficeDocumentVersion"("documentId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "OfficialLetter_reference_key" ON "OfficialLetter"("reference");

-- CreateIndex
CREATE INDEX "OfficialLetter_createdAt_idx" ON "OfficialLetter"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementDraft_approvalRequestId_key" ON "AnnouncementDraft"("approvalRequestId");

-- CreateIndex
CREATE INDEX "AnnouncementDraft_createdBy_status_createdAt_idx" ON "AnnouncementDraft"("createdBy", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ContentCalendarItem_scheduledAt_status_idx" ON "ContentCalendarItem"("scheduledAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformRequest_approvalRequestId_key" ON "PlatformRequest"("approvalRequestId");

-- CreateIndex
CREATE INDEX "PlatformRequest_status_createdAt_idx" ON "PlatformRequest"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SocialEvent_approvalRequestId_key" ON "SocialEvent"("approvalRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialEvent_calendarEventId_key" ON "SocialEvent"("calendarEventId");

-- CreateIndex
CREATE INDEX "SocialEvent_status_startsAt_idx" ON "SocialEvent"("status", "startsAt");

-- CreateIndex
CREATE INDEX "EventVolunteer_eventId_createdAt_idx" ON "EventVolunteer"("eventId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EventVolunteer_eventId_studentName_key" ON "EventVolunteer"("eventId", "studentName");

-- CreateIndex
CREATE INDEX "EventRSVP_eventId_response_idx" ON "EventRSVP"("eventId", "response");

-- CreateIndex
CREATE UNIQUE INDEX "EventRSVP_eventId_studentName_key" ON "EventRSVP"("eventId", "studentName");

-- CreateIndex
CREATE INDEX "EventFeedback_eventId_createdAt_idx" ON "EventFeedback"("eventId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DuesMember_memberCode_key" ON "DuesMember"("memberCode");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceQuery_trackingId_key" ON "FinanceQuery"("trackingId");

-- CreateIndex
CREATE INDEX "FinanceQuery_status_createdAt_idx" ON "FinanceQuery"("status", "createdAt");

-- CreateIndex
CREATE INDEX "LedgerEntry_office_createdAt_idx" ON "LedgerEntry"("office", "createdAt");

-- CreateIndex
CREATE INDEX "LedgerEntry_event_createdAt_idx" ON "LedgerEntry"("event", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetPlan_scopeType_scopeName_term_key" ON "BudgetPlan"("scopeType", "scopeName", "term");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenditureRequest_approvalRequestId_key" ON "ExpenditureRequest"("approvalRequestId");

-- CreateIndex
CREATE INDEX "ExpenditureRequest_status_createdAt_idx" ON "ExpenditureRequest"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WelfareCase_trackingId_key" ON "WelfareCase"("trackingId");

-- CreateIndex
CREATE INDEX "WelfareCase_status_createdAt_idx" ON "WelfareCase"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "ConcernUpdate" ADD CONSTRAINT "ConcernUpdate_concernId_fkey" FOREIGN KEY ("concernId") REFERENCES "Concern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PulseVote" ADD CONSTRAINT "PulseVote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "PulsePoll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalDecision" ADD CONSTRAINT "ApprovalDecision_approvalRequestId_fkey" FOREIGN KEY ("approvalRequestId") REFERENCES "ApprovalRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingRSVP" ADD CONSTRAINT "MeetingRSVP_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeMember" ADD CONSTRAINT "CommitteeMember_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MotionVote" ADD CONSTRAINT "MotionVote_motionId_fkey" FOREIGN KEY ("motionId") REFERENCES "Motion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeDocumentVersion" ADD CONSTRAINT "OfficeDocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "OfficeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVolunteer" ADD CONSTRAINT "EventVolunteer_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "SocialEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRSVP" ADD CONSTRAINT "EventRSVP_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "SocialEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFeedback" ADD CONSTRAINT "EventFeedback_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "SocialEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
