import assert from "node:assert/strict";
import test from "node:test";
import { db } from "@/lib/db";
import { appendAuditLog, verifyAuditEntries } from "@/lib/audit";

test("audit chain verifies and detects a row edited in the database", async () => {
  const rollbackMarker = "rollback audit tamper test";
  await assert.rejects(
    db.$transaction(async (tx) => {
      await appendAuditLog({
        action: "TEST_AUDIT_CHAIN",
        office: "system",
        entityType: "Test",
        details: { marker: rollbackMarker },
        occurredAt: new Date().toISOString(),
      }, tx);
      const entries = await tx.auditLog.findMany({ orderBy: { sequence: "asc" } });
      const verify = (rows: typeof entries) => verifyAuditEntries(rows);
      assert.equal(verify(entries).intact, true);

      const last = entries.at(-1);
      assert.ok(last);
      await tx.auditLog.update({
        where: { sequence: last.sequence },
        data: { payload: JSON.stringify({ edited: true }) },
      });
      const tampered = await tx.auditLog.findMany({ orderBy: { sequence: "asc" } });
      assert.equal(verify(tampered).intact, false);
      throw new Error(rollbackMarker);
    }),
    (error: unknown) => error instanceof Error && error.message === rollbackMarker
  );
});
