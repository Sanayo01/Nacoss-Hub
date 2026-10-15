import crypto from "crypto";
import { cookies } from "next/headers";
import { EXECUTIVES_LIST } from "@/config/executives";

const COOKIE_NAME = "nacos_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export type OfficeSlug =
  | "president"
  | "vice-president"
  | "general-secretary"
  | "assistant-general-secretary"
  | "financial-secretary"
  | "treasurer"
  | "social-secretary"
  | "sports-secretary"
  | "welfare-secretary"
  | "software-director"
  | "pro";

export interface AdminSession {
  sessionId: string;
  office: OfficeSlug | null;
  expiresAt: number;
}

function signature(payload: string): Buffer {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be configured with at least 32 characters.");
  }
  return crypto.createHmac("sha256", secret).update(payload).digest();
}

export function createSignedToken(payload: string): string {
  const encodedPayload = Buffer.from(payload).toString("base64url");
  return `${encodedPayload}.${signature(encodedPayload).toString("hex")}`;
}

export function verifySignedToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2 || !/^[a-f0-9]{64}$/i.test(parts[1])) return false;
  const expected = signature(parts[0]);
  const supplied = Buffer.from(parts[1], "hex");
  return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
}

export async function setAdminSession(office: OfficeSlug | null = null): Promise<void> {
  const cookieStore = cookies();
  const session: AdminSession = {
    sessionId: crypto.randomUUID(),
    office,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  cookieStore.set(COOKIE_NAME, createSignedToken(JSON.stringify(session)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession(): Promise<void> {
  cookies().delete(COOKIE_NAME);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const sessionCookie = cookies().get(COOKIE_NAME);
  if (!sessionCookie?.value || !verifySignedToken(sessionCookie.value)) return null;
  try {
    const payload = Buffer.from(sessionCookie.value.split(".")[0], "base64url").toString();
    const session = JSON.parse(payload) as AdminSession;
    if (!session.sessionId || !Number.isFinite(session.expiresAt) || session.expiresAt <= Date.now()) {
      return null;
    }
    const validOffice = session.office === null ||
      EXECUTIVES_LIST.some((executive) => executive.officeSlug === session.office);
    return validOffice ? session : null;
  } catch {
    return null;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}

export async function setSelectedOffice(office: OfficeSlug | null): Promise<void> {
  const session = await getAdminSession();
  if (!session) throw new Error("An authenticated admin session is required");
  const cookieStore = cookies();
  cookieStore.set(
    COOKIE_NAME,
    createSignedToken(JSON.stringify({ ...session, office })),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.max(1, Math.floor((session.expiresAt - Date.now()) / 1000)),
    }
  );
}
