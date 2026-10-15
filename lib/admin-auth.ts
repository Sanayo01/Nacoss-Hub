import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "nacos_admin_session";
const SECRET = process.env.ADMIN_SESSION_SECRET || "nacos-prototype-super-secret-key-32chars";

// Note for future developer handover:
// This is a minimal single-passcode prototype authentication session for local demonstration.
// For production, this MUST be replaced with individual per-executive accounts,
// hashed passwords (argon2/bcrypt), session persistence in DB/Redis, and role-based access control (RBAC).

export function createSignedToken(payload: string): string {
  const hmac = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${hmac}`;
}

export function verifySignedToken(token: string): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function setAdminSession(): Promise<void> {
  const cookieStore = cookies();
  const token = createSignedToken("admin_authenticated_" + Date.now());
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) return false;
  return verifySignedToken(sessionCookie.value);
}
