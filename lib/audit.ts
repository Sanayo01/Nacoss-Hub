import crypto from "crypto";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { OfficeSlug } from "@/lib/admin-auth";

const GENESIS_HASH = "GENESIS";

export interface AuditPayload {
  action: string;
  office: OfficeSlug | "system";
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  occurredAt: string;
}

export interface AuditEntry {
  payload: string;
  prevHash: string;
  hash: string;
}

export function calculateAuditHash(prevHash: string, payload: string): string {
  return crypto.createHash("sha256").update(prevHash + payload).digest("hex");
}

export function verifyAuditEntries(entries: readonly AuditEntry[]): {
  intact: boolean;
  rowsChecked: number;
  brokenAt?: number;
} {
  let expectedPreviousHash = GENESIS_HASH;
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (
      entry.prevHash !== expectedPreviousHash ||
      entry.hash !== calculateAuditHash(entry.prevHash, entry.payload)
    ) {
      return { intact: false, rowsChecked: index, brokenAt: index + 1 };
    }
    expectedPreviousHash = entry.hash;
  }
  return { intact: true, rowsChecked: entries.length };
}

export async function appendAuditLog(
  payload: AuditPayload,
  client: Pick<Prisma.TransactionClient, "auditLog"> = db
) {
  const serializedPayload = JSON.stringify(payload);
  const latest = await client.auditLog.findFirst({ orderBy: { sequence: "desc" } });
  const prevHash = latest?.hash ?? GENESIS_HASH;
  return client.auditLog.create({
    data: {
      payload: serializedPayload,
      prevHash,
      hash: calculateAuditHash(prevHash, serializedPayload),
    },
  });
}

export async function verifyChain() {
  const rows = await db.auditLog.findMany({
    orderBy: { sequence: "asc" },
    select: { payload: true, prevHash: true, hash: true },
  });
  return verifyAuditEntries(rows);
}

export const AUDIT_GENESIS_HASH = GENESIS_HASH;
