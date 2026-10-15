import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { EXECUTIVES_LIST } from "@/config/executives";
import { isOfficeSlug } from "@/config/permissions";
import { db } from "@/lib/db";
import { getOfficeDay } from "@/lib/office-data";

test("a scheduled meeting is visible on every office dashboard", async () => {
  const title = `Visibility test ${randomUUID()}`;
  const date = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const meeting = await db.meeting.create({
    data: {
      title,
      date,
      venue: "Test venue",
      agenda: "Visibility test only",
      mandatory: false,
      createdBy: "president",
      reminderAt: new Date(date.getTime() - 48 * 60 * 60 * 1000),
      rsvps: { create: EXECUTIVES_LIST.map(({ officeSlug }) => ({ office: officeSlug })) },
    },
  });
  try {
    for (const { officeSlug } of EXECUTIVES_LIST) {
      assert.ok(isOfficeSlug(officeSlug), `${officeSlug} should be a configured office`);
      const dashboard = await getOfficeDay(officeSlug);
      assert.ok(dashboard.meetings.some((item) => item.id === meeting.id), `${officeSlug} dashboard should show meeting`);
    }
  } finally {
    await db.meeting.delete({ where: { id: meeting.id } });
  }
});
