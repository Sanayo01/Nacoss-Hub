import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isOfficeSlug } from "@/config/permissions";
import { gateOfficeCapability } from "@/lib/office-access";
import { createOfficeTask } from "@/lib/office-data";

const schema = z.object({
  title: z.string().trim().min(3).max(160),
  assignedToOffice: z.string(),
  dueDate: z.string().datetime().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("pro.studio");
  if ("response" in gate) return gate.response;
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    if (!isOfficeSlug(parsed.data.assignedToOffice)) return NextResponse.json({ success: false, error: "Choose a valid office." }, { status: 400 });
    const task = await createOfficeTask({
      title: parsed.data.title,
      description: "Event coverage assignment from the PRO studio.",
      assignedByOffice: gate.office,
      assignedToOffice: parsed.data.assignedToOffice,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      linkedActionItem: `PRO_COVERAGE:${parsed.data.title}`,
    });
    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error("POST /api/office/pro/coverage error:", error);
    return NextResponse.json({ success: false, error: "Failed to assign event coverage" }, { status: 500 });
  }
}
