import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { getScorecardPromises, saveScorecardPromise } from "@/lib/secretariat";

const schema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(3000).default(""),
  baseline: z.string().trim().max(500).nullable().optional(),
  target: z.string().trim().max(500).nullable().optional(),
  delivered: z.string().trim().max(500).nullable().optional(),
  isPublished: z.boolean(),
});

export async function GET() {
  const gate = await gateOfficeCapability("gensec.scorecard.manage");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: await getScorecardPromises(true) });
  } catch (error) {
    console.error("GET /api/office/scorecard-promises error:", error);
    return NextResponse.json({ success: false, error: "Failed to load published promises" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("gensec.scorecard.manage");
  if ("response" in gate) return gate.response;
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    const data = await saveScorecardPromise({
      ...parsed.data,
      baseline: parsed.data.baseline ?? null,
      target: parsed.data.target ?? null,
      delivered: parsed.data.delivered ?? null,
      updatedBy: gate.office,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("POST /api/office/scorecard-promises error:", error);
    return NextResponse.json({ success: false, error: "Failed to update scorecard promise" }, { status: 500 });
  }
}
