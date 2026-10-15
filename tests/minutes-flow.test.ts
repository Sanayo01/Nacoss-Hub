import assert from "node:assert/strict";
import test from "node:test";
import { db } from "@/lib/db";
import { approveMinutesInTransaction } from "@/lib/minutes";

test("approving minutes locks them, creates owner tasks, and publishes shareable digest only", async () => {
  const marker = "rollback minutes workflow test";
  await assert.rejects(
    db.$transaction(async (tx) => {
      const meeting = await tx.meeting.create({
        data: {
          title: "Minutes workflow test",
          date: new Date(Date.now() + 60_000),
          venue: "Test",
          agenda: "Workflow",
          mandatory: false,
          createdBy: "president",
        },
      });
      const minutes = await tx.meetingMinutes.create({
        data: {
          meetingId: meeting.id,
          content: "Test notes",
          attendance: '["assistant-general-secretary"]',
          agendaItems: JSON.stringify([
            { decision: "Publish the mock schedule", why: "Testing", ownerOffice: "president", deadline: "", shareable: true },
            { decision: "Confidential follow-up", why: "Private test item", ownerOffice: "vice-president", deadline: "", shareable: false },
          ]),
          draftedBy: "assistant-general-secretary",
          status: "PENDING",
        },
      });

      const result = await approveMinutesInTransaction(tx, minutes.id, "general-secretary");
      const tasks = await tx.task.findMany({ where: { linkedMeetingId: meeting.id } });
      assert.equal(result.minutes.status, "LOCKED");
      assert.equal(result.minutes.approvedBy, "general-secretary");
      assert.equal(tasks.length, 2);
      assert.ok(tasks.every((task) => task.assignedByOffice === "general-secretary"));
      assert.ok(tasks.some((task) => task.assignedToOffice === "president"));
      assert.ok(result.digest.content.includes("Publish the mock schedule"));
      assert.equal(result.digest.content.includes("Confidential follow-up"), false);
      throw new Error(marker);
    }),
    (error: unknown) => error instanceof Error && error.message === marker
  );
});
