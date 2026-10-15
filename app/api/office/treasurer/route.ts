import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { sanitizedText } from "@/lib/input-validation";
import { createBudgetPlan, createLedgerEntry, listTreasurerWorkspace } from "@/lib/remaining-offices";

const ledgerSchema = z.object({
  kind: z.enum(["INCOME", "EXPENDITURE"]),
  title: sanitizedText(3, 160),
  office: sanitizedText(2, 80),
  event: z.string().trim().max(160).optional().nullable(),
  term: sanitizedText(2, 60).default("CURRENT"),
  amount: z.number().positive().max(100000000),
  receiptRef: z.string().trim().max(100).regex(/^[\w-]*$/).optional().nullable(),
});
const budgetSchema = z.object({
  kind: z.literal("BUDGET"),
  scopeType: z.enum(["OFFICE", "EVENT"]),
  scopeName: sanitizedText(2, 160),
  amount: z.number().positive().max(100000000),
  term: sanitizedText(2, 60),
});

export async function GET() {
  const gate = await gateOfficeCapability("treasury.ledger.view");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: await listTreasurerWorkspace() });
  } catch (error) {
    console.error("GET /api/office/treasurer error:", error);
    return NextResponse.json({ success: false, error: "Failed to load treasury workspace." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const gate = await gateOfficeCapability("treasury.ledger.manage");
  if ("response" in gate) return gate.response;
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 }); }
  const parsedBudget = budgetSchema.safeParse(body);
  if (parsedBudget.success) {
    try {
      const plan = await createBudgetPlan({ ...parsedBudget.data, office: gate.office });
      return NextResponse.json({ success: true, data: plan }, { status: 201 });
    } catch (error) {
      console.error("POST /api/office/treasurer budget error:", error);
      return NextResponse.json({ success: false, error: "Could not save budget plan." }, { status: 500 });
    }
  }
  const parsed = ledgerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid ledger entry." }, { status: 400 });
  try {
    const entry = await createLedgerEntry({ ...parsed.data, recordedBy: gate.office });
    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    console.error("POST /api/office/treasurer error:", error);
    return NextResponse.json({ success: false, error: "Could not record ledger entry." }, { status: 500 });
  }
}
