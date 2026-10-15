import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { resolveApprovalPolicy } from "@/config/approvals";
import { db } from "@/lib/db";
import { decideApproval } from "@/lib/approvals";
import {
  createAnnouncementDraft,
  createSocialEvent,
  listPublicSocialEvents,
  listSoftwareBoard,
  saveDeveloperVolunteer,
  submitPlatformRequest,
  submitTechnicalChange,
  updateVolunteerHours,
  volunteerForEvent,
} from "@/lib/three-offices";

test("PRO official announcements wait for approval before appearing in the student feed", async () => {
  const marker = randomUUID();
  const draft = await createAnnouncementDraft({
    title: `Official ${marker}`,
    body: "An approval-gated announcement test.",
    category: "General",
    pinned: true,
    official: true,
    submit: true,
    office: "pro",
  });
  assert.equal(draft.status, "PENDING");
  const approval = await db.approvalRequest.findUniqueOrThrow({ where: { id: draft.approvalRequestId! } });
  assert.deepEqual(resolveApprovalPolicy(approval.type, "pro", JSON.parse(approval.payload)), {
    approvers: ["general-secretary", "president"],
    mode: "ANY",
  });
  assert.equal(await db.announcement.count({ where: { title: draft.title } }), 0);
  await decideApproval({ requestId: approval.id, office: "general-secretary", decision: "APPROVED" });
  const published = await db.announcement.findFirstOrThrow({ where: { title: draft.title } });
  assert.equal(published.pinned, true);
  assert.equal(published.viewCount, 0);
  assert.equal((await db.announcementDraft.findUniqueOrThrow({ where: { id: draft.id } })).status, "PUBLISHED");
  await db.announcement.delete({ where: { id: published.id } });
  await db.announcementDraft.delete({ where: { id: draft.id } });
  await db.approvalRequest.delete({ where: { id: approval.id } });
});

test("student feature requests are visible on the Software Director board", async () => {
  const marker = randomUUID();
  const request = await submitPlatformRequest({
    kind: "FEATURE",
    title: `Request ${marker}`,
    description: "This student feature request should appear on the director board.",
  });
  const board = await listSoftwareBoard();
  assert.ok(board.requests.some((item) => item.id === request.id && item.kind === "FEATURE"));
  await db.platformRequest.delete({ where: { id: request.id } });
});

test("approved social events publish to the student calendar and opt-in volunteers receive recorded hours", async () => {
  const marker = randomUUID();
  const startsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const endsAt = new Date(startsAt.getTime() + 3 * 60 * 60 * 1000);
  const event = await createSocialEvent({
    title: `Event ${marker}`,
    description: "Test an approved social event and volunteer signup.",
    venue: "Demo venue",
    startsAt,
    endsAt,
    budgetRequest: 25000,
    checklist: ["Confirm venue"],
    office: "social-secretary",
  });
  const approval = await db.approvalRequest.findUniqueOrThrow({ where: { id: event.approvalRequestId! } });
  assert.deepEqual(resolveApprovalPolicy(approval.type, "social-secretary", JSON.parse(approval.payload)), {
    approvers: ["treasurer"],
    mode: "ANY",
  });
  await decideApproval({ requestId: approval.id, office: "treasurer", decision: "APPROVED" });
  const approved = await db.socialEvent.findUniqueOrThrow({ where: { id: event.id } });
  assert.equal(approved.status, "APPROVED");
  assert.ok(approved.calendarEventId);
  const volunteer = await volunteerForEvent({
    eventId: event.id,
    studentName: `Demo Student ${marker}`,
    task: "Registration desk",
    hoursOptIn: true,
  });
  const updated = await updateVolunteerHours({ id: volunteer.id, hours: 3.5, office: "social-secretary" });
  assert.equal(updated.hours, 3.5);
  const publicEvent = (await listPublicSocialEvents()).find((item) => item.id === event.id);
  assert.equal(publicEvent?._count.volunteers, 1);
  assert.equal("volunteers" in (publicEvent ?? {}), false);
  await db.socialEvent.delete({ where: { id: event.id } });
  if (approved.calendarEventId) await db.calendarEvent.delete({ where: { id: approved.calendarEventId } });
  await db.approvalRequest.delete({ where: { id: approval.id } });
});

test("technical account and role changes require both President and General Secretary", async () => {
  const marker = randomUUID();
  const change = await submitTechnicalChange({
    title: `Access change ${marker}`,
    description: "Request a demo-only technical role adjustment.",
    office: "software-director",
  });
  const approval = await db.approvalRequest.findUniqueOrThrow({ where: { id: change.approvalRequestId! } });
  await decideApproval({ requestId: approval.id, office: "president", decision: "APPROVED" });
  assert.equal((await db.platformRequest.findUniqueOrThrow({ where: { id: change.id } })).status, "PENDING_APPROVAL");
  await decideApproval({ requestId: approval.id, office: "general-secretary", decision: "APPROVED" });
  assert.equal((await db.platformRequest.findUniqueOrThrow({ where: { id: change.id } })).status, "APPROVED");
  await db.platformRequest.delete({ where: { id: change.id } });
  await db.approvalRequest.delete({ where: { id: approval.id } });
});

test("Software Director capabilities are isolated to that office", async () => {
  const volunteer = await saveDeveloperVolunteer({
    name: "Demo developer",
    skills: "TypeScript",
    availability: "Weekends",
    office: "software-director",
  });
  assert.equal(volunteer.name, "Demo developer");
  await db.developerVolunteer.delete({ where: { id: volunteer.id } });
});
