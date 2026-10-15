import type { OfficeSlug } from "@/lib/admin-auth";

export type ApprovalMode = "ANY" | "ALL";

export interface ApprovalPolicy {
  approvers: OfficeSlug[];
  mode: ApprovalMode;
}

const GENERAL_SECRETARY: OfficeSlug = "general-secretary";
const PRESIDENT: OfficeSlug = "president";
const TREASURER: OfficeSlug = "treasurer";

export function getTreasurerSpendingLimit(): number {
  const configuredLimit = Number(process.env.TREASURER_SPENDING_APPROVAL_LIMIT ?? 50000);
  return Number.isFinite(configuredLimit) && configuredLimit >= 0 ? configuredLimit : 50000;
}

export const APPROVAL_POLICIES: Record<string, (makerOffice: OfficeSlug, payload: unknown) => ApprovalPolicy | null> = {
  OFFICE_ACTIVATION: () => ({ approvers: [PRESIDENT, GENERAL_SECRETARY], mode: "ALL" }),
  ROLE_CHANGE: () => ({ approvers: [PRESIDENT, GENERAL_SECRETARY], mode: "ALL" }),
  FULL_STUDENT_DATA_EXPORT: () => ({ approvers: [PRESIDENT, GENERAL_SECRETARY], mode: "ALL" }),
  MINUTES_APPROVAL: () => ({ approvers: [GENERAL_SECRETARY], mode: "ANY" }),
  OFFICIAL_LETTER_APPROVAL: () => ({ approvers: [GENERAL_SECRETARY], mode: "ANY" }),
  EVENT_BUDGET: () => ({ approvers: [TREASURER], mode: "ANY" }),
  EXPENDITURE_REQUEST: () => ({ approvers: [TREASURER], mode: "ANY" }),
  EXPENDITURE_PRESIDENT_APPROVAL: () => ({ approvers: [PRESIDENT], mode: "ANY" }),
  VP_MEETING_REQUEST: () => ({ approvers: [PRESIDENT], mode: "ANY" }),
  OFFICIAL_ANNOUNCEMENT: (makerOffice) =>
    makerOffice === "pro"
      ? { approvers: [GENERAL_SECRETARY, PRESIDENT], mode: "ANY" }
      : null,
  URGENT_ANNOUNCEMENT: (makerOffice) =>
    makerOffice === "pro"
      ? { approvers: [GENERAL_SECRETARY, PRESIDENT], mode: "ANY" }
      : null,
  SPENDING: (makerOffice, payload) => {
    const amount =
      typeof payload === "object" && payload !== null && "amount" in payload
        ? Number((payload as { amount: unknown }).amount)
        : NaN;
    const limit = getTreasurerSpendingLimit();
    return makerOffice === "treasurer" && Number.isFinite(amount) && amount > limit
      ? { approvers: [PRESIDENT], mode: "ANY" }
      : { approvers: [GENERAL_SECRETARY], mode: "ANY" };
  },
};

export function resolveApprovalPolicy(
  actionType: string,
  makerOffice: OfficeSlug,
  payload: unknown
): ApprovalPolicy {
  const specialPolicy = APPROVAL_POLICIES[actionType]?.(makerOffice, payload);
  if (specialPolicy) return specialPolicy;
  if (makerOffice === "vice-president") return { approvers: [PRESIDENT], mode: "ANY" };
  if (makerOffice === "assistant-general-secretary") {
    return { approvers: [GENERAL_SECRETARY], mode: "ANY" };
  }
  if (makerOffice === GENERAL_SECRETARY) return { approvers: [PRESIDENT], mode: "ANY" };
  return { approvers: [GENERAL_SECRETARY], mode: "ANY" };
}
