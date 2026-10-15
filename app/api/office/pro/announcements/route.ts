import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { createAnnouncementDraft, listProStudio } from "@/lib/three-offices";
import { sanitizeText } from "@/lib/utils";

const schema = z.object({
  title: z.string().trim().min(3).max(200),
  body: z.string().trim().min(10).max(10000),
  category: z.enum(["General", "Academic", "Event", "Urgent", "Deadline"]),
  pinned: z.boolean().default(false),
  official: z.boolean().default(false),
  submit: z.boolean().default(false),
});

export async function GET() {
  const gate = await gateOfficeCapability("pro.studio");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: await listProStudio() });
  } catch (error) {
    console.error("GET /api/office/pro/announcements error:", error);
    return NextResponse.json({ success: false, error: "Failed to load PRO studio" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("pro.studio");
  if ("response" in gate) return gate.response;
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    const draft = await createAnnouncementDraft({
      ...parsed.data,
      title: sanitizeText(parsed.data.title),
      body: sanitizeText(parsed.data.body),
      office: gate.office,
    });
    return NextResponse.json({ success: true, data: draft }, { status: 201 });
  } catch (error) {
    console.error("POST /api/office/pro/announcements error:", error);
    return NextResponse.json({ success: false, error: "Failed to save announcement draft" }, { status: 500 });
  }
}
