import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTrackingId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomCode = "";
  for (let i = 0; i < 4; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NH-2026-${randomCode}`;
}

export function sanitizeText(text: string): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>?/gm, "") // Strip HTML tags
    .trim();
}

export function formatDate(dateInput: Date | string): string {
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(dateInput: Date | string): string {
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
