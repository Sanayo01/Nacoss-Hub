import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export function middleware(request: NextRequest) {
  if (request.method !== "POST" || !request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }
  const ip = request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const result = checkRateLimit(`${request.nextUrl.pathname}:${ip}`, 20, 15 * 60 * 1000);
  if (!result.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(result.resetMs / 1000)) } }
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
