import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { db, getAdminConcerns } from "@/lib/db";

test("anonymous sender identity is removed from office concern results", async () => {
  const trackingId = `anon-test-${randomUUID()}`;
  const concern = await db.concern.create({
    data: {
      trackingId,
      category: "TEST",
      subject: "Anonymous test",
      message: "Mock test concern",
      isAnonymous: true,
      senderName: "Must be hidden",
      senderEmail: "hidden@example.invalid",
      targetOfficeSlug: "general-secretary",
    },
  });
  try {
    const rows = await getAdminConcerns({ office: "general-secretary", status: "all" });
    const result = rows.find((item) => item.id === concern.id);
    assert.ok(result);
    assert.equal(result.senderName, null);
    assert.equal(result.senderEmail, null);
  } finally {
    await db.concern.delete({ where: { id: concern.id } });
  }
});
