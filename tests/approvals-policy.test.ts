import assert from "node:assert/strict";
import test from "node:test";
import { resolveApprovalPolicy } from "@/config/approvals";

test("VP and AGS actions route to their required approver", () => {
  assert.deepEqual(resolveApprovalPolicy("GENERAL_ACTION", "vice-president", {}).approvers, ["president"]);
  assert.deepEqual(resolveApprovalPolicy("GENERAL_ACTION", "assistant-general-secretary", {}).approvers, ["general-secretary"]);
});

test("PRO official and urgent announcements use one-of two senior approvers", () => {
  assert.deepEqual(resolveApprovalPolicy("OFFICIAL_ANNOUNCEMENT", "pro", {}), {
    approvers: ["general-secretary", "president"],
    mode: "ANY",
  });
  assert.deepEqual(resolveApprovalPolicy("URGENT_ANNOUNCEMENT", "pro", {}).mode, "ANY");
});

test("two-key actions require both distinct offices", () => {
  for (const type of ["OFFICE_ACTIVATION", "ROLE_CHANGE", "FULL_STUDENT_DATA_EXPORT"]) {
    const policy = resolveApprovalPolicy(type, "assistant-general-secretary", {});
    assert.equal(policy.mode, "ALL");
    assert.deepEqual(new Set(policy.approvers), new Set(["president", "general-secretary"]));
    assert.equal(policy.approvers.length, 2);
  }
});

test("official letters drafted by the AGS require General Secretary approval", () => {
  assert.deepEqual(resolveApprovalPolicy("OFFICIAL_LETTER_APPROVAL", "assistant-general-secretary", {}), {
    approvers: ["general-secretary"],
    mode: "ANY",
  });
});

test("treasurer spending above the configured threshold routes to President", () => {
  const previous = process.env.TREASURER_SPENDING_APPROVAL_LIMIT;
  process.env.TREASURER_SPENDING_APPROVAL_LIMIT = "1000";
  try {
    assert.deepEqual(resolveApprovalPolicy("SPENDING", "treasurer", { amount: 1001 }).approvers, ["president"]);
    assert.deepEqual(resolveApprovalPolicy("SPENDING", "treasurer", { amount: 1000 }).approvers, ["general-secretary"]);
  } finally {
    if (previous === undefined) delete process.env.TREASURER_SPENDING_APPROVAL_LIMIT;
    else process.env.TREASURER_SPENDING_APPROVAL_LIMIT = previous;
  }
});

test("Social Secretary event budget requests route to the Treasurer", () => {
  assert.deepEqual(resolveApprovalPolicy("EVENT_BUDGET", "social-secretary", { amount: 25000 }), {
    approvers: ["treasurer"],
    mode: "ANY",
  });
});
