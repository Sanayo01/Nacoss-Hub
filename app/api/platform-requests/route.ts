import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { submitPlatformRequest } from "@/lib/three-offices";

const schema = z.object({
  kind: z.enum(["BUG", "FEATURE"]),
  title: z.string().trim().min(4).max(160),
  description: z.string().trim().min(10).max(5000),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    const session = await getAdminSession();
    const request = await submitPlatformRequest({ ...parsed.data, office: session?.office ?? undefined });
    return NextResponse.json({ success: true, data: { id: request.id, kind: request.kind, status: request.status } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/platform-requests error:", error);
    return NextResponse.json({ success: false, error: "Could not submit your platform request." }, { status: 500 });
  }
}
