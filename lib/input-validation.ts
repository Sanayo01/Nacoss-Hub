import { z } from "zod";
import { sanitizeText } from "@/lib/utils";

export function sanitizedText(min: number, max: number) {
  return z.string().trim().min(min).max(max).transform(sanitizeText)
    .refine((value) => value.length >= min, `Must contain at least ${min} characters.`);
}

export function optionalSanitizedText(max: number) {
  return z.string().trim().max(max).transform(sanitizeText).optional().nullable();
}
