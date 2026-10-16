import assert from "node:assert/strict";
import test from "node:test";
import { db } from "@/lib/db";
import { createOfficialLetter } from "@/lib/secretariat";

test("official letter references are unique and follow NACOSS/GS/YYYY/NNN", async () => {
  const subject = `Reference uniqueness test ${Date.now()}`;
  const first = await createOfficialLetter({
    recipient: "Test recipient",
    subject,
    body: "Mock test body only.",
    createdBy: "assistant-general-secretary",
  });
  const second = await createOfficialLetter({
    recipient: "Test recipient",
    subject,
    body: "Mock test body only.",
    createdBy: "assistant-general-secretary",
  });
  try {
    assert.notEqual(first.reference, second.reference);
    assert.match(first.reference, /^NACOSS\/GS\/\d{4}\/\d{3,}$/);
    assert.match(second.reference, /^NACOSS\/GS\/\d{4}\/\d{3,}$/);
  } finally {
    await db.officialLetter.deleteMany({ where: { subject } });
  }
});
