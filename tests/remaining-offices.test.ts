import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { db } from "@/lib/db";
import { decideApproval } from "@/lib/approvals";
import {
  createDuesReminder,
  createExpenditureRequest,
  listFinancialSecretaryWorkspace,
  listProDuesReminderDrafts,
  listSportsWorkspace,
  listTreasurerWorkspace,
  listWelfareWorkspace,
  saveSportsRecord,
  submitFinanceQuery,
  submitSportsSignup,
  submitWelfareCase,
  updateDuesRecord,
} from "@/lib/remaining-offices";

test("anonymous financial and welfare sender identity is discarded in storage and office workspaces", async () => {
  const marker = randomUUID();
  const finance = await submitFinanceQuery({
    subject: `Query ${marker}`,
    message: "This is a mock anonymous financial question.",
    isAnonymous: true,
    senderName: `HIDDEN-SENDER-${marker}`,
    senderEmail: `${marker}@example.test`,
  });
  const welfare = await submitWelfareCase({
    subject: `Case ${marker}`,
    message: "This is a mock anonymous welfare case.",
    isAnonymous: true,
    senderName: `HIDDEN-SENDER-${marker}`,
    senderEmail: `${marker}@example.test`,
  });
  try {
    const [storedFinance, storedWelfare, financeWorkspace, welfareWorkspace] = await Promise.all([
      db.financeQuery.findUniqueOrThrow({ where: { id: finance.id } }),
      db.welfareCase.findUniqueOrThrow({ where: { id: welfare.id } }),
      listFinancialSecretaryWorkspace(),
      listWelfareWorkspace(),
    ]);
    assert.equal(storedFinance.senderName, null);
    assert.equal(storedFinance.senderEmail, null);
    assert.equal(storedWelfare.senderName, null);
    assert.equal(storedWelfare.senderEmail, null);
    assert.equal(JSON.stringify(financeWorkspace.queries).includes(`HIDDEN-SENDER-${marker}`), false);
    assert.equal(JSON.stringify(welfareWorkspace.cases).includes(`HIDDEN-SENDER-${marker}`), false);
    assert.equal(JSON.stringify(financeWorkspace.queries).includes(`${marker}@example.test`), false);
    assert.equal(JSON.stringify(welfareWorkspace.cases).includes(`${marker}@example.test`), false);
  } finally {
    await db.financeQuery.delete({ where: { id: finance.id } });
    await db.welfareCase.delete({ where: { id: welfare.id } });
  }
});

test("expenditure requests require Treasurer review and President approval over the limit", async () => {
  const previousLimit = process.env.TREASURER_SPENDING_APPROVAL_LIMIT;
  process.env.TREASURER_SPENDING_APPROVAL_LIMIT = "500";
  const marker = randomUUID();
  let requestId = "";
  let treasurerApprovalId = "";
  let presidentApprovalId = "";
  try {
    const request = await createExpenditureRequest({
      title: `High expenditure ${marker}`,
      purpose: "Test Treasurer-first and President threshold approval flow.",
      office: "social-secretary",
      event: `Test event ${marker}`,
      amount: 1000,
      requestedBy: "social-secretary",
    });
    requestId = request.id;
    treasurerApprovalId = request.approvalRequestId ?? "";
    await decideApproval({ requestId: treasurerApprovalId, office: "treasurer", decision: "APPROVED" });
    const awaitingPresident = await db.expenditureRequest.findUniqueOrThrow({ where: { id: request.id } });
    presidentApprovalId = awaitingPresident.approvalRequestId ?? "";
    assert.equal(awaitingPresident.status, "PENDING_PRESIDENT");
    assert.ok(presidentApprovalId);
    assert.equal(await db.ledgerEntry.count({ where: { title: request.title } }), 0);
    await decideApproval({ requestId: presidentApprovalId, office: "president", decision: "APPROVED" });
    assert.equal((await db.expenditureRequest.findUniqueOrThrow({ where: { id: request.id } })).status, "APPROVED");
    assert.equal(await db.ledgerEntry.count({ where: { title: request.title, kind: "EXPENDITURE" } }), 1);
  } finally {
    if (requestId) await db.expenditureRequest.delete({ where: { id: requestId } });
    if (treasurerApprovalId) await db.approvalRequest.delete({ where: { id: treasurerApprovalId } });
    if (presidentApprovalId) await db.approvalRequest.delete({ where: { id: presidentApprovalId } });
    if (requestId) await db.ledgerEntry.deleteMany({ where: { title: { contains: marker } } });
    if (previousLimit === undefined) delete process.env.TREASURER_SPENDING_APPROVAL_LIMIT;
    else process.env.TREASURER_SPENDING_APPROVAL_LIMIT = previousLimit;
  }
});

test("low expenditure request posts to ledger only after Treasurer approval", async () => {
  const marker = randomUUID();
  const request = await createExpenditureRequest({
    title: `Low expenditure ${marker}`,
    purpose: "Test record-only approval below the President threshold.",
    office: "sports-secretary",
    amount: 100,
    requestedBy: "sports-secretary",
  });
  const approvalId = request.approvalRequestId!;
  try {
    await decideApproval({ requestId: approvalId, office: "treasurer", decision: "APPROVED" });
    assert.equal((await db.expenditureRequest.findUniqueOrThrow({ where: { id: request.id } })).status, "APPROVED");
    assert.equal(await db.ledgerEntry.count({ where: { title: request.title, kind: "EXPENDITURE" } }), 1);
  } finally {
    await db.expenditureRequest.delete({ where: { id: request.id } });
    await db.approvalRequest.delete({ where: { id: approvalId } });
    await db.ledgerEntry.deleteMany({ where: { title: request.title } });
  }
});

test("Financial Secretary can track mock dues and hand reminder drafts to PRO", async () => {
  const marker = randomUUID();
  const memberCode = `TEST-${marker}`;
  let reminderId = "";
  try {
    const member = await updateDuesRecord({
      memberCode,
      displayName: "Mock test member",
      level: "200L",
      status: "PAID",
      amountPaid: 2500,
      receiptRef: "MOCK-RECEIPT",
      office: "financial-secretary",
    });
    const reminder = await createDuesReminder({
      title: `Dues reminder ${marker}`,
      body: "Draft only; the PRO reviews and decides whether to publish.",
      office: "financial-secretary",
    });
    reminderId = reminder.id;
    const [workspace, proDrafts] = await Promise.all([listFinancialSecretaryWorkspace(), listProDuesReminderDrafts()]);
    assert.ok(workspace.dues.some((item) => item.id === member.id && item.status === "PAID"));
    assert.ok(workspace.monthlyDues.recordedAmount >= 2500);
    assert.ok(proDrafts.some((item) => item.id === reminder.id));
  } finally {
    await db.duesMember.deleteMany({ where: { memberCode } });
    if (reminderId) await db.duesReminderDraft.delete({ where: { id: reminderId } });
  }
});

test("sports signups remain office-visible and fixture records are persistent", async () => {
  const marker = randomUUID();
  let teamId = "";
  let signupId = "";
  try {
    const team = await saveSportsRecord({
      kind: "TEAM",
      title: `Mock team ${marker}`,
      details: "Mock roster category",
      office: "sports-secretary",
    });
    teamId = team.id;
    const signup = await submitSportsSignup({ name: `Mock student ${marker}`, sport: "Chess", level: "300L" });
    signupId = signup.id;
    const workspace = await listSportsWorkspace();
    const sports = await db.sportsSignup.findUniqueOrThrow({ where: { id: signup.id } });
    assert.equal(sports.sport, "Chess");
    assert.ok(workspace.signups.some((item) => item.id === signup.id));
  } finally {
    if (signupId) await db.sportsSignup.delete({ where: { id: signupId } });
    if (teamId) await db.sportsTeam.delete({ where: { id: teamId } });
  }
});
