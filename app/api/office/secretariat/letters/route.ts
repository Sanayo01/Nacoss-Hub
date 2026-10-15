import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability, getActingOffice } from "@/lib/office-access";
import { createApprovalRequest } from "@/lib/approvals";
import { createOfficialLetter, listOfficialLetters, returnOfficialLetterToDraft, submitOfficialLetter } from "@/lib/secretariat";

const createSchema = z.object({
  recipient: z.string().trim().min(2).max(200),
  subject: z.string().trim().min(3).max(250),
  body: z.string().trim().min(10).max(15000),
});
const submitSchema = z.object({ id: z.string().min(1), action: z.literal("submit") });

export async function GET() {
  const gate = await gateOfficeCapability("ags.letters.draft");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: await listOfficialLetters(gate.office, await getActingOffice(gate.office)) });
  } catch (error) {
    console.error("GET /api/office/secretariat/letters error:", error);
    return NextResponse.json({ success: false, error: "Failed to load official letters" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("ags.letters.draft");
  if ("response" in gate) return gate.response;
  try {
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    const letter = await createOfficialLetter({ ...parsed.data, createdBy: gate.office });
    return NextResponse.json({ success: true, data: letter }, { status: 201 });
  } catch (error) {
    console.error("POST /api/office/secretariat/letters error:", error);
    return NextResponse.json({ success: false, error: "Failed to create letter draft" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const gate = await gateOfficeCapability("ags.letters.draft");
  if ("response" in gate) return gate.response;
  try {
    const parsed = submitSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    if (gate.office === "general-secretary") {
      return NextResponse.json({ success: false, error: "The General Secretary cannot submit their own letter for approval." }, { status: 403 });
    }
    const letter = await submitOfficialLetter(parsed.data.id, gate.office);
    try {
      const approval = await createApprovalRequest({
        type: "OFFICIAL_LETTER_APPROVAL",
        payload: { letterId: letter.id, title: `${letter.reference}: ${letter.subject}` },
        makerOffice: gate.office,
      });
      return NextResponse.json({ success: true, data: { letter, approval } }, { status: 202 });
    } catch (error) {
      await returnOfficialLetterToDraft(letter.id, gate.office);
      throw error;
    }
  } catch (error) {
    console.error("PATCH /api/office/secretariat/letters error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Failed to submit letter" }, { status: 409 });
  }
}
