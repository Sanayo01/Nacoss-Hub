import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, setAdminSession, clearAdminSession } from "@/lib/admin-auth";
import { checkRateLimit } from "@/lib/rate-limit";

// Note for developers:
// This prototype uses a shared ADMIN_PASSCODE environment variable for simple verification.
// For production, replace this endpoint with individual executive login (username/password + 2FA).

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  return NextResponse.json({ authenticated });
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

    const { passcode } = await req.json();
    const correctPasscode = process.env.ADMIN_PASSCODE || "nacos-unilag-exec-2026";

    if (!passcode || passcode !== correctPasscode) {
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

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ success: true, message: "Logged out." });
}
