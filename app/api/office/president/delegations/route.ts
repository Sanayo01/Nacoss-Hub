import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { createDelegation, getDelegations } from "@/lib/power-office-data";

const schema = z.object({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
});

export async function GET() {
  const gate = await gateOfficeCapability("president.delegate");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: await getDelegations("president") });
  } catch (error) {
    console.error("GET /api/office/president/delegations error:", error);
    return NextResponse.json({ success: false, error: "Failed to load delegations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("president.delegate");
  if ("response" in gate) return gate.response;
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    const delegation = await createDelegation({
      grantingOffice: "president",
      delegateOffice: "vice-president",
      startsAt: new Date(parsed.data.startsAt),
      endsAt: new Date(parsed.data.endsAt),
      grantedBy: gate.office,
    });
    return NextResponse.json({ success: true, data: delegation }, { status: 201 });
  } catch (error) {
    console.error("POST /api/office/president/delegations error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Could not delegate powers" }, { status: 400 });
  }
}
