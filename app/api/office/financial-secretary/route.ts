import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { sanitizedText } from "@/lib/input-validation";
import { createDuesReminder, listFinancialSecretaryWorkspace, updateDuesRecord } from "@/lib/remaining-offices";

const duesSchema = z.object({
  action: z.literal("DUES"),
  memberCode: sanitizedText(3, 40),
  displayName: sanitizedText(2, 100),
  level: sanitizedText(2, 30),
  status: z.enum(["PAID", "UNPAID"]),
  amountPaid: z.number().min(0).max(1000000),
  receiptRef: z.string().trim().max(100).regex(/^[\w-]*$/).optional().nullable(),
});
const reminderSchema = z.object({
  action: z.literal("REMINDER"),
  title: sanitizedText(3, 120),
  body: sanitizedText(10, 2000),
});

export async function GET() {
  const gate = await gateOfficeCapability("finance.dues.view");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: await listFinancialSecretaryWorkspace() });
  } catch (error) {
    console.error("GET /api/office/financial-secretary error:", error);
    return NextResponse.json({ success: false, error: "Failed to load financial secretary workspace." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 }); }
  const parsedDues = duesSchema.safeParse(body);
  if (parsedDues.success) {
    const gate = await gateOfficeCapability("finance.dues.manage");
    if ("response" in gate) return gate.response;
    try {
      const data = parsedDues.data;
      const saved = await updateDuesRecord({
        ...data,
        amountPaid: data.status === "PAID" ? data.amountPaid : 0,
        receiptRef: data.status === "PAID" ? data.receiptRef ?? null : null,
        office: gate.office,
      });
      return NextResponse.json({ success: true, data: saved }, { status: 201 });
    } catch (error) {
      console.error("POST /api/office/financial-secretary dues error:", error);
      return NextResponse.json({ success: false, error: "Could not update dues record." }, { status: 500 });
    }
  }
  const parsedReminder = reminderSchema.safeParse(body);
  if (!parsedReminder.success) {
    return NextResponse.json({ success: false, error: parsedReminder.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }
  const gate = await gateOfficeCapability("finance.reminders.manage");
  if ("response" in gate) return gate.response;
  try {
    const reminder = await createDuesReminder({ ...parsedReminder.data, office: gate.office });
    return NextResponse.json({ success: true, data: reminder }, { status: 201 });
  } catch (error) {
    console.error("POST /api/office/financial-secretary reminder error:", error);
    return NextResponse.json({ success: false, error: "Could not hand reminder draft to PRO." }, { status: 500 });
  }
}
