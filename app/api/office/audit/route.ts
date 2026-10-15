import { NextResponse } from "next/server";
import { gateOfficeCapability } from "@/lib/office-access";
import { verifyChain } from "@/lib/audit";
import { db } from "@/lib/db";

export async function GET() {
  const gate = await gateOfficeCapability("audit.view");
  if ("response" in gate) return gate.response;
  try {
    const [verification, entries] = await Promise.all([
      verifyChain(),
      db.auditLog.findMany({ orderBy: { sequence: "desc" }, take: 100 }),
    ]);
    return NextResponse.json({
      success: true,
      data: {
        verification,
        entries: entries.map((entry) => ({ ...entry, payload: JSON.parse(entry.payload) })),
      },
    });
  } catch (error) {
    console.error("GET /api/office/audit error:", error);
    return NextResponse.json({ success: false, error: "Failed to verify audit log" }, { status: 500 });
  }
}
