import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { appendAuditLog } from "@/lib/audit";
import { createApprovalRequestInTransaction, notifyApprovalRequestApprovers } from "@/lib/approvals";
import { getTreasurerSpendingLimit } from "@/config/approvals";
import type { OfficeSlug } from "@/lib/admin-auth";

export async function listFinancialSecretaryWorkspace() {
  const [dues, queries, reminders] = await Promise.all([
    db.duesMember.findMany({ orderBy: [{ status: "asc" }, { memberCode: "asc" }], take: 500 }),
    db.financeQuery.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    db.duesReminderDraft.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  const now = new Date();
  const monthly = dues.filter((member) =>
    member.status === "PAID" &&
    member.paidAt?.getUTCFullYear() === now.getUTCFullYear() &&
    member.paidAt.getUTCMonth() === now.getUTCMonth()
  );
  return {
    dues,
    monthlyDues: { paidCount: monthly.length, recordedAmount: monthly.reduce((sum, member) => sum + member.amountPaid, 0) },
    queries: queries.map((query) => query.isAnonymous
      ? { ...query, senderName: null, senderEmail: null }
      : query),
    reminders,
  };
}

export async function updateDuesRecord(input: {
  memberCode: string;
  displayName: string;
  level: string;
  status: "PAID" | "UNPAID";
  amountPaid: number;
  receiptRef: string | null;
  office: OfficeSlug;
}) {
  return db.$transaction(async (tx) => {
    const member = await tx.duesMember.upsert({
      where: { memberCode: input.memberCode },
      create: {
        memberCode: input.memberCode,
        displayName: input.displayName,
        level: input.level,
        status: input.status,
        amountPaid: input.status === "PAID" ? input.amountPaid : 0,
        receiptRef: input.status === "PAID" ? input.receiptRef : null,
        paidAt: input.status === "PAID" ? new Date() : null,
      },
      update: {
        displayName: input.displayName,
        level: input.level,
        status: input.status,
        amountPaid: input.status === "PAID" ? input.amountPaid : 0,
        receiptRef: input.status === "PAID" ? input.receiptRef : null,
        paidAt: input.status === "PAID" ? new Date() : null,
      },
    });
    await appendAuditLog({
      action: "DUES_RECORD_UPDATED",
      office: input.office,
      entityType: "DuesMember",
      entityId: member.id,
      details: { memberCode: member.memberCode, status: member.status, amountPaid: member.amountPaid },
      occurredAt: new Date().toISOString(),
    }, tx);
    return member;
  });
}

export async function createDuesReminder(input: { title: string; body: string; office: OfficeSlug }) {
  return db.$transaction(async (tx) => {
    const reminder = await tx.duesReminderDraft.create({
      data: { title: input.title, body: input.body, createdBy: input.office },
    });
    await tx.notification.create({
      data: {
        office: "pro",
        title: "Dues reminder draft ready",
        message: input.title,
        link: "/office/pro",
        kind: "FINANCE",
      },
    });
    await appendAuditLog({
      action: "DUES_REMINDER_HANDED_TO_PRO",
      office: input.office,
      entityType: "DuesReminderDraft",
      entityId: reminder.id,
      details: { title: reminder.title },
      occurredAt: new Date().toISOString(),
    }, tx);
    return reminder;
  });
}

export async function listProDuesReminderDrafts() {
  return db.duesReminderDraft.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
}

export async function submitFinanceQuery(input: {
  subject: string;
  message: string;
  isAnonymous: boolean;
  senderName?: string | null;
  senderEmail?: string | null;
}) {
  return db.$transaction(async (tx) => {
    const query = await tx.financeQuery.create({
      data: {
        trackingId: `NQ-${randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`,
        subject: input.subject,
        message: input.message,
        isAnonymous: input.isAnonymous,
        senderName: input.isAnonymous ? null : input.senderName ?? null,
        senderEmail: input.isAnonymous ? null : input.senderEmail ?? null,
      },
    });
    await appendAuditLog({
      action: "FINANCIAL_QUERY_SUBMITTED",
      office: "system",
      entityType: "FinanceQuery",
      entityId: query.id,
      details: { trackingId: query.trackingId, isAnonymous: query.isAnonymous },
      occurredAt: new Date().toISOString(),
    }, tx);
    return { id: query.id, trackingId: query.trackingId };
  });
}

export async function createLedgerEntry(input: {
  kind: "INCOME" | "EXPENDITURE";
  title: string;
  office: string;
  event?: string | null;
  term: string;
  amount: number;
  receiptRef?: string | null;
  recordedBy: OfficeSlug;
}) {
  return db.$transaction(async (tx) => {
    const entry = await tx.ledgerEntry.create({
      data: {
        kind: input.kind,
        title: input.title,
        office: input.office,
        event: input.event ?? null,
        term: input.term,
        amount: input.amount,
        receiptRef: input.receiptRef ?? null,
        recordedBy: input.recordedBy,
      },
    });
    await appendAuditLog({
      action: "LEDGER_ENTRY_RECORDED",
      office: input.recordedBy,
      entityType: "LedgerEntry",
      entityId: entry.id,
      details: { kind: entry.kind, office: entry.office, event: entry.event, term: entry.term, amount: entry.amount },
      occurredAt: new Date().toISOString(),
    }, tx);
    return entry;
  });
}

export async function saveTreasuryReceipt(input: {
  filePath: string;
  fileName: string;
  mimeType: string;
  size: number;
  office: OfficeSlug;
}) {
  return db.$transaction(async (tx) => {
    const receipt = await tx.treasuryReceipt.create({
      data: { ...input, uploadedBy: input.office },
    });
    await appendAuditLog({
      action: "TREASURY_RECEIPT_UPLOADED",
      office: input.office,
      entityType: "TreasuryReceipt",
      entityId: receipt.id,
      details: { mimeType: receipt.mimeType, size: receipt.size },
      occurredAt: new Date().toISOString(),
    }, tx);
    return receipt;
  });
}

export async function getTreasuryReceipt(id: string) {
  return db.treasuryReceipt.findUnique({ where: { id } });
}

export async function listTreasurerWorkspace() {
  const [ledger, requests, plans] = await Promise.all([
    db.ledgerEntry.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
    db.expenditureRequest.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    db.budgetPlan.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
  ]);
  const budgets = plans.map((plan) => {
    const scope = `${plan.scopeType}:${plan.scopeName}`;
    const actual = ledger.filter((entry) =>
      (plan.scopeType === "EVENT" ? entry.event === plan.scopeName : entry.office === plan.scopeName) &&
      entry.term === plan.term
    ).filter((entry) => entry.kind === "EXPENDITURE").reduce((sum, entry) => sum + entry.amount, 0);
    return { id: plan.id, scope, term: plan.term, planned: plan.amount, actual, remaining: plan.amount - actual };
  });
  return {
    ledger,
    requests,
    budgets,
    termStatements: [...new Set(ledger.map((entry) => entry.term))].map((term) => ({
      term,
      income: ledger.filter((entry) => entry.term === term && entry.kind === "INCOME").reduce((sum, entry) => sum + entry.amount, 0),
      expenditure: ledger.filter((entry) => entry.term === term && entry.kind === "EXPENDITURE").reduce((sum, entry) => sum + entry.amount, 0),
    })),
  };
}

export async function createBudgetPlan(input: {
  scopeType: "OFFICE" | "EVENT";
  scopeName: string;
  amount: number;
  term: string;
  office: OfficeSlug;
}) {
  return db.$transaction(async (tx) => {
    const plan = await tx.budgetPlan.upsert({
      where: { scopeType_scopeName_term: { scopeType: input.scopeType, scopeName: input.scopeName, term: input.term } },
      create: { scopeType: input.scopeType, scopeName: input.scopeName, amount: input.amount, term: input.term, createdBy: input.office },
      update: { amount: input.amount, createdBy: input.office },
    });
    await appendAuditLog({
      action: "BUDGET_PLAN_SAVED",
      office: input.office,
      entityType: "BudgetPlan",
      entityId: plan.id,
      details: { scopeType: plan.scopeType, scopeName: plan.scopeName, amount: plan.amount, term: plan.term },
      occurredAt: new Date().toISOString(),
    }, tx);
    return plan;
  });
}

export async function createExpenditureRequest(input: {
  title: string;
  purpose: string;
  office: string;
  event?: string | null;
  amount: number;
  term?: string;
  requestedBy: OfficeSlug;
  receiptRef?: string | null;
}) {
  if (input.requestedBy === "president" && input.amount > getTreasurerSpendingLimit()) {
    throw new Error("A President-submitted request above the approval limit needs a separate President account, which is not available in demo mode.");
  }
  const request = await db.$transaction(async (tx) => {
    const request = await tx.expenditureRequest.create({
      data: {
        title: input.title,
        purpose: input.purpose,
        office: input.office,
        event: input.event ?? null,
        amount: input.amount,
        term: input.term ?? "CURRENT",
        requestedBy: input.requestedBy,
        receiptRef: input.receiptRef ?? null,
      },
    });
    const approval = await createApprovalRequestInTransaction(tx, {
      type: "EXPENDITURE_REQUEST",
      makerOffice: input.requestedBy,
      payload: { expenditureRequestId: request.id, title: request.title, amount: request.amount },
    });
    const updated = await tx.expenditureRequest.update({
      where: { id: request.id },
      data: { approvalRequestId: approval.request.id },
    });
    await appendAuditLog({
      action: "EXPENDITURE_REQUEST_SUBMITTED",
      office: input.requestedBy,
      entityType: "ExpenditureRequest",
      entityId: request.id,
      details: { amount: request.amount, office: request.office, event: request.event },
      occurredAt: new Date().toISOString(),
    }, tx);
    return updated;
  });
  const approval = await db.approvalRequest.findUniqueOrThrow({ where: { id: request.approvalRequestId! } });
  await notifyApprovalRequestApprovers(approval.type, JSON.parse(approval.requiredApprovers) as OfficeSlug[]);
  return request;
}

export async function listWelfareWorkspace() {
  const [cases, referrals, drives, resources] = await Promise.all([
    db.welfareCase.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    db.welfareReferral.findMany({ orderBy: { name: "asc" } }),
    db.welfareDrive.findMany({ orderBy: { startsAt: "asc" }, take: 100 }),
    db.wellbeingResource.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return {
    cases: cases.map((item) => item.isAnonymous
      ? { ...item, senderName: null, senderEmail: null }
      : item),
    referrals,
    drives,
    resources,
  };
}

export async function listPublicWellbeingResources() {
  const [drives, resources] = await Promise.all([
    db.welfareDrive.findMany({ where: { status: { not: "CANCELLED" } }, orderBy: { startsAt: "asc" }, take: 100 }),
    db.wellbeingResource.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return { drives, resources };
}

export async function submitWelfareCase(input: {
  subject: string;
  message: string;
  isAnonymous: boolean;
  senderName?: string | null;
  senderEmail?: string | null;
}) {
  return db.$transaction(async (tx) => {
    const item = await tx.welfareCase.create({
      data: {
        trackingId: `NW-${randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`,
        subject: input.subject,
        message: input.message,
        isAnonymous: input.isAnonymous,
        senderName: input.isAnonymous ? null : input.senderName ?? null,
        senderEmail: input.isAnonymous ? null : input.senderEmail ?? null,
      },
    });
    await appendAuditLog({
      action: "WELFARE_CASE_SUBMITTED",
      office: "system",
      entityType: "WelfareCase",
      entityId: item.id,
      details: { trackingId: item.trackingId, isAnonymous: item.isAnonymous },
      occurredAt: new Date().toISOString(),
    }, tx);
    return { id: item.id, trackingId: item.trackingId };
  });
}

export async function updateWelfareCase(input: {
  id: string;
  status: "OPEN" | "IN_PROGRESS" | "REFERRED" | "CLOSED";
  office: OfficeSlug;
}) {
  return db.$transaction(async (tx) => {
    const item = await tx.welfareCase.update({ where: { id: input.id }, data: { status: input.status } });
    await appendAuditLog({
      action: "WELFARE_CASE_STATUS_UPDATED",
      office: input.office,
      entityType: "WelfareCase",
      entityId: item.id,
      details: { status: item.status },
      occurredAt: new Date().toISOString(),
    }, tx);
    return item;
  });
}

export async function createWelfareResource(input: {
  kind: "REFERRAL" | "DRIVE" | "RESOURCE";
  title: string;
  description: string;
  contact?: string;
  link?: string | null;
  startsAt?: Date;
  endsAt?: Date;
  office: OfficeSlug;
}) {
  return db.$transaction(async (tx) => {
    const record = input.kind === "REFERRAL"
      ? await tx.welfareReferral.create({
          data: { name: input.title, service: input.description, description: input.description, contact: input.contact ?? "" },
        })
      : input.kind === "DRIVE"
        ? await (async () => {
            if (!input.startsAt || !input.endsAt) throw new Error("Welfare drives need start and end dates.");
            return tx.welfareDrive.create({
              data: { title: input.title, description: input.description, startsAt: input.startsAt, endsAt: input.endsAt },
            });
          })()
        : await tx.wellbeingResource.create({
            data: { title: input.title, description: input.description, link: input.link ?? null },
          });
    await appendAuditLog({
      action: `WELFARE_${input.kind}_RECORDED`,
      office: input.office,
      entityType: input.kind,
      entityId: record.id,
      details: { title: input.title },
      occurredAt: new Date().toISOString(),
    }, tx);
    return record;
  });
}

export async function listSportsWorkspace() {
  const [teams, fixtures, training, equipment, signups, achievements] = await Promise.all([
    db.sportsTeam.findMany({ orderBy: { name: "asc" } }),
    db.sportsFixture.findMany({ orderBy: { startsAt: "asc" }, take: 200 }),
    db.trainingSession.findMany({ orderBy: { startsAt: "asc" }, take: 100 }),
    db.equipmentItem.findMany({ orderBy: { name: "asc" } }),
    db.sportsSignup.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    db.sportsAchievement.findMany({ orderBy: { achievedAt: "desc" }, take: 100 }),
  ]);
  return { teams, fixtures, training, equipment, signups, achievements };
}

export async function saveSportsRecord(input: {
  kind: "TEAM" | "FIXTURE" | "TRAINING" | "EQUIPMENT" | "ACHIEVEMENT";
  title: string;
  details: string;
  date?: Date;
  quantity?: number;
  venue?: string;
  roster?: string[];
  office: OfficeSlug;
}) {
  return db.$transaction(async (tx) => {
    const record = input.kind === "TEAM"
      ? await tx.sportsTeam.create({ data: { name: input.title, category: input.details, roster: JSON.stringify(input.roster ?? []) } })
      : input.kind === "FIXTURE"
        ? await tx.sportsFixture.create({ data: { team: input.title, opponent: input.details, venue: input.venue ?? "To be confirmed", startsAt: input.date ?? new Date() } })
        : input.kind === "TRAINING"
          ? await tx.trainingSession.create({ data: { team: input.title, venue: input.details, startsAt: input.date ?? new Date(), notes: "" } })
          : input.kind === "EQUIPMENT"
            ? await tx.equipmentItem.create({ data: { name: input.title, condition: input.details, quantity: input.quantity ?? 0 } })
            : await tx.sportsAchievement.create({ data: { title: input.title, details: input.details, achievedAt: input.date ?? new Date() } });
    await appendAuditLog({
      action: `SPORTS_${input.kind}_RECORDED`,
      office: input.office,
      entityType: input.kind,
      entityId: record.id,
      details: { title: input.title },
      occurredAt: new Date().toISOString(),
    }, tx);
    return record;
  });
}

export async function updateSportsResult(input: { fixtureId: string; result: string; office: OfficeSlug }) {
  return db.$transaction(async (tx) => {
    const fixture = await tx.sportsFixture.update({ where: { id: input.fixtureId }, data: { result: input.result } });
    await appendAuditLog({
      action: "SPORTS_FIXTURE_RESULT_RECORDED",
      office: input.office,
      entityType: "SportsFixture",
      entityId: fixture.id,
      details: { result: fixture.result },
      occurredAt: new Date().toISOString(),
    }, tx);
    return fixture;
  });
}

export async function submitSportsSignup(input: { name: string; sport: string; level: string }) {
  return db.$transaction(async (tx) => {
    const signup = await tx.sportsSignup.create({ data: input });
    await appendAuditLog({
      action: "SPORTS_SIGNUP_SUBMITTED",
      office: "system",
      entityType: "SportsSignup",
      entityId: signup.id,
      details: { sport: signup.sport, level: signup.level },
      occurredAt: new Date().toISOString(),
    }, tx);
    return signup;
  });
}

export async function listPublicSportsSummary() {
  const [fixtures, training, achievements] = await Promise.all([
    db.sportsFixture.findMany({ orderBy: { startsAt: "asc" }, take: 100 }),
    db.trainingSession.findMany({ orderBy: { startsAt: "asc" }, take: 100 }),
    db.sportsAchievement.findMany({ orderBy: { achievedAt: "desc" }, take: 100 }),
  ]);
  return { fixtures, training, achievements };
}

export async function getPublicFinanceSummary() {
  const entries = await db.ledgerEntry.findMany({ select: { kind: true, amount: true, office: true, event: true } });
  const totals = entries.reduce((result, entry) => {
    result[entry.kind === "INCOME" ? "income" : "expenditure"] += entry.amount;
    return result;
  }, { income: 0, expenditure: 0 });
  return {
    income: totals.income,
    expenditure: totals.expenditure,
    balance: totals.income - totals.expenditure,
    byOffice: [...new Set(entries.map((entry) => entry.office))].map((office) => ({
      office,
      income: entries.filter((entry) => entry.office === office && entry.kind === "INCOME").reduce((sum, entry) => sum + entry.amount, 0),
      expenditure: entries.filter((entry) => entry.office === office && entry.kind === "EXPENDITURE").reduce((sum, entry) => sum + entry.amount, 0),
    })),
    events: [...new Set(entries.map((entry) => entry.event).filter((event): event is string => Boolean(event)))].map((event) => ({
      event,
      income: entries.filter((entry) => entry.event === event && entry.kind === "INCOME").reduce((sum, entry) => sum + entry.amount, 0),
      expenditure: entries.filter((entry) => entry.event === event && entry.kind === "EXPENDITURE").reduce((sum, entry) => sum + entry.amount, 0),
    })),
  };
}
