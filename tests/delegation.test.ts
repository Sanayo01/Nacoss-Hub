import assert from "node:assert/strict";
import test from "node:test";
import { db } from "@/lib/db";
import { createDelegation, updateDelegationStatuses } from "@/lib/power-office-data";

test("delegation moves from scheduled to active to expired and validates office pairs", async () => {
  const now = new Date();
  const startsAt = new Date(now.getTime() + 1000);
  const endsAt = new Date(now.getTime() + 10_000);
  const delegation = await createDelegation({
    grantingOffice: "president",
    delegateOffice: "vice-president",
    startsAt,
    endsAt,
    grantedBy: "president",
  });
  try {
    await assert.rejects(createDelegation({
      grantingOffice: "president",
      delegateOffice: "assistant-general-secretary",
      startsAt,
      endsAt,
      grantedBy: "president",
    }), /matching deputy office/);
    await updateDelegationStatuses(new Date(startsAt.getTime() + 1), delegation.id);
    assert.equal((await db.delegation.findUniqueOrThrow({ where: { id: delegation.id } })).status, "ACTIVE");
    await updateDelegationStatuses(new Date(endsAt.getTime() + 1), delegation.id);
    assert.equal((await db.delegation.findUniqueOrThrow({ where: { id: delegation.id } })).status, "EXPIRED");
  } finally {
    await db.delegation.delete({ where: { id: delegation.id } });
    await db.notification.deleteMany({ where: { office: "vice-president", title: "Delegated approval powers" } });
  }
});
