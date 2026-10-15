import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  clearAdminSession,
  getAdminSession,
  setAdminSession,
  setSelectedOffice,
  type OfficeSlug,
} from "@/lib/admin-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { isOfficeSlug } from "@/config/permissions";

const loginSchema = z.object({ passcode: z.string().min(1).max(256) });
const officeSchema = z.object({
  office: z.custom<OfficeSlug>((office) => typeof office === "string" && isOfficeSlug(office), {
    message: "Select a valid office.",
  }).nullable(),
});

// Note for developers:
// This prototype uses a shared ADMIN_PASSCODE environment variable for simple verification.
// For production, replace this endpoint with individual executive login (username/password + 2FA).

export async function GET() {
  const session = await getAdminSession();
  return NextResponse.json({
    authenticated: Boolean(session),
    office: session?.office ?? null,
  });
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    // Rate limit: 5 attempts per 15 minutes to prevent brute forcing
    const rateCheck = checkRateLimit(`admin_auth_${ip}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    let body: unknown;
    try { body = await req.json(); }
    catch { return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 }); }
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: "Enter the executive passcode." }, { status: 400 });
    const correctPasscode = process.env.ADMIN_PASSCODE;
    if (!correctPasscode) {
      console.error("ADMIN_PASSCODE is not configured.");
      return NextResponse.json({ success: false, error: "Executive login is not configured." }, { status: 503 });
    }

    if (parsed.data.passcode !== correctPasscode) {
      return NextResponse.json(
        { success: false, error: "Invalid executive passcode." },
        { status: 401 }
      );
    }

    await setAdminSession();
    return NextResponse.json({ success: true, message: "Authenticated successfully." });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    let body: unknown;
    try { body = await req.json(); }
    catch { return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 }); }
    const parsed = officeSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Select a valid office." }, { status: 400 });
    const office = parsed.data.office;
    await setSelectedOffice(office);
    return NextResponse.json({ success: true, office });
  } catch (error) {
    console.error("Admin office selection error:", error);
    return NextResponse.json(
      { success: false, error: "Could not select office." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ success: true, message: "Logged out." });
}
