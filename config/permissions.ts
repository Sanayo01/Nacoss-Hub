import { EXECUTIVES_LIST } from "@/config/executives";
import type { OfficeSlug } from "@/lib/admin-auth";

export const CAPABILITIES = [
  "office.access",
  "audit.view",
  "meetings.view",
  "meetings.create",
  "tasks.view",
  "tasks.create",
  "tasks.assign",
  "tasks.update",
  "approvals.view",
  "approvals.decide",
  "concerns.view",
  "concerns.manage",
  "documents.view",
  "reports.view",
  "notifications.view",
  "serious.submit",
  "announcements.publish",
  "admin.legacy",
  "president.manage",
  "president.scorecard",
  "president.motions",
  "president.delegate",
  "vp.committees",
  "vp.coordinate",
  "vp.meeting.request",
  "gensec.minutes.draft",
  "gensec.minutes.approve",
  "gensec.documents.manage",
  "gensec.letters.manage",
  "gensec.oversight.manage",
  "gensec.concerns.manage",
  "gensec.directory.manage",
  "gensec.scorecard.manage",
  "gensec.delegate",
  "ags.minutes.draft",
  "ags.documents.file",
  "ags.letters.draft",
  "ags.siwes.process",
  "ags.concerns.triage",
  "motions.vote",
  "oversight.respond",
  "pro.studio",
  "pro.calendar",
  "pro.assets",
  "software.board",
  "software.roster",
  "software.release",
  "software.technical-change",
  "social.events",
  "social.volunteers",
  "social.reports",
  "budget.approve",
  "finance.dues.view",
  "finance.dues.manage",
  "finance.queries.view",
  "finance.reminders.manage",
  "treasury.ledger.view",
  "treasury.ledger.manage",
  "treasury.expenditure.review",
  "finance.transparency.view",
  "finance.receipt.upload",
  "finance.receipt.view",
  "pro.reminders.view",
  "sports.manage",
  "sports.signup.view",
  "welfare.cases.view",
  "welfare.cases.manage",
  "welfare.resources.manage",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

const sharedOfficeCapabilities: Capability[] = [
  "office.access",
  "meetings.view",
  "tasks.view",
  "tasks.create",
  "tasks.update",
  "approvals.view",
  "concerns.view",
  "documents.view",
  "reports.view",
  "notifications.view",
  "serious.submit",
  "motions.vote",
  "oversight.respond",
  "finance.receipt.upload",
];

export const ROLE_CAPABILITIES: Record<OfficeSlug, readonly Capability[]> = {
  president: [...sharedOfficeCapabilities, "meetings.create", "audit.view", "tasks.assign", "approvals.decide", "concerns.manage", "announcements.publish", "admin.legacy", "president.manage", "president.scorecard", "president.motions", "president.delegate", "welfare.cases.view", "welfare.cases.manage", "finance.transparency.view", "treasury.ledger.view", "finance.receipt.view"],
  "vice-president": [...sharedOfficeCapabilities, "audit.view", "tasks.assign", "concerns.manage", "announcements.publish", "admin.legacy", "vp.committees", "vp.coordinate", "vp.meeting.request", "president.scorecard"],
  "general-secretary": [...sharedOfficeCapabilities, "meetings.create", "audit.view", "tasks.assign", "approvals.decide", "concerns.manage", "announcements.publish", "admin.legacy", "ags.minutes.draft", "ags.documents.file", "ags.letters.draft", "gensec.minutes.draft", "gensec.minutes.approve", "gensec.documents.manage", "gensec.letters.manage", "gensec.oversight.manage", "gensec.concerns.manage", "gensec.directory.manage", "gensec.scorecard.manage", "gensec.delegate"],
  "assistant-general-secretary": [...sharedOfficeCapabilities, "concerns.manage", "announcements.publish", "admin.legacy", "ags.minutes.draft", "ags.documents.file", "ags.letters.draft", "ags.siwes.process", "ags.concerns.triage"],
  "financial-secretary": [...sharedOfficeCapabilities, "concerns.manage", "admin.legacy", "finance.dues.view", "finance.dues.manage", "finance.queries.view", "finance.reminders.manage", "finance.receipt.view"],
  treasurer: [...sharedOfficeCapabilities, "concerns.manage", "admin.legacy", "approvals.decide", "budget.approve", "treasury.ledger.view", "treasury.ledger.manage", "treasury.expenditure.review", "finance.transparency.view", "finance.receipt.view"],
  "social-secretary": [...sharedOfficeCapabilities, "concerns.manage", "announcements.publish", "admin.legacy", "tasks.assign", "social.events", "social.volunteers", "social.reports"],
  "sports-secretary": [...sharedOfficeCapabilities, "concerns.manage", "announcements.publish", "admin.legacy", "sports.manage", "sports.signup.view"],
  "welfare-secretary": [...sharedOfficeCapabilities, "concerns.manage", "announcements.publish", "admin.legacy", "welfare.cases.view", "welfare.cases.manage", "welfare.resources.manage"],
  "software-director": [...sharedOfficeCapabilities, "concerns.manage", "announcements.publish", "admin.legacy", "software.board", "software.roster", "software.release", "software.technical-change"],
  pro: [...sharedOfficeCapabilities, "concerns.manage", "announcements.publish", "admin.legacy", "pro.studio", "pro.calendar", "pro.assets", "pro.reminders.view", "tasks.assign"],
};

export class CapabilityError extends Error {
  constructor(readonly office: string | null, readonly capability: Capability) {
    super(`Office ${office ?? "(not selected)"} lacks ${capability}`);
    this.name = "CapabilityError";
  }
}

export function isOfficeSlug(office: string): office is OfficeSlug {
  return EXECUTIVES_LIST.some((executive) => executive.officeSlug === office);
}

export function can(office: string | null | undefined, capability: Capability): office is OfficeSlug {
  return Boolean(office && isOfficeSlug(office) && ROLE_CAPABILITIES[office].includes(capability));
}

export function requireCapability(
  office: string | null | undefined,
  capability: Capability
): asserts office is OfficeSlug {
  if (!can(office, capability)) throw new CapabilityError(office ?? null, capability);
}
