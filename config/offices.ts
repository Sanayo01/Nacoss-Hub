import { EXECUTIVES_LIST } from "./executives";

export interface OfficeConfig {
  name: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  email: string;
}

export const CATEGORY_OFFICE_MAP: Record<string, string> = {
  Academics: "vice-president",
  Welfare: "welfare-secretary",
  Events: "social-secretary",
  "Finance/Dues": "financial-secretary",
  "Software/Tech": "software-director",
  "Sports": "sports-secretary",
  "Media/Announcements": "pro",
  "General/Other": "general-secretary",
};

export const OFFICE_SLUGS = {
  PRESIDENT: "president",
  VICE_PRESIDENT: "vice-president",
  GENERAL_SECRETARY: "general-secretary",
  ASSISTANT_GENERAL_SECRETARY: "assistant-general-secretary",
  FINANCIAL_SECRETARY: "financial-secretary",
  TREASURER: "treasurer",
  SOCIAL_SECRETARY: "social-secretary",
  SPORTS_SECRETARY: "sports-secretary",
  WELFARE_SECRETARY: "welfare-secretary",
  SOFTWARE_DIRECTOR: "software-director",
  PRO: "pro",
} as const;

export function getTargetOfficeSlug(category: string): string {
  return CATEGORY_OFFICE_MAP[category] || OFFICE_SLUGS.GENERAL_SECRETARY;
}

export function getAllOfficeSlugs(): string[] {
  return EXECUTIVES_LIST.map((e) => e.officeSlug);
}
