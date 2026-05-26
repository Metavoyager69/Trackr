import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { AppConfigurationError } from "./errors";

const COOKIE_NAME = "trackr_session";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function getSessionSecret() {
  const secret = process.env.TRACKR_SESSION_SECRET || process.env.TRACKR_ADMIN_TOKEN;
  if (!secret) {
    throw new AppConfigurationError("Set TRACKR_SESSION_SECRET before using the app.");
  }
  return secret;
}

export type SessionPayload = {
  userId: string;
};

function signSession(userId: string, expiryTimestamp: number, secret: string): string {
  const payload = `${userId}:${expiryTimestamp}`;
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifyAndDecodeSession(cookieValue: string, secret: string): SessionPayload | null {
  const dotIndex = cookieValue.lastIndexOf(".");
  if (dotIndex === -1) {
    return null;
  }

  const payload = cookieValue.slice(0, dotIndex);
  const signature = cookieValue.slice(dotIndex + 1);

  const expectedSignature = createHmac("sha256", secret).update(payload).digest("hex");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length) {
    return null;
  }

  const match = timingSafeEqual(sigBuffer, expectedBuffer);
  if (!match) {
    return null;
  }

  const [userId, expiryStr] = payload.split(":");
  if (!userId || !expiryStr) return null;

  const expiryTimestamp = Number(expiryStr);
  if (Number.isNaN(expiryTimestamp) || expiryTimestamp < Date.now()) {
    return null;
  }

  return { userId };
}

export async function createSessionCookie(userId: string) {
  const secret = getSessionSecret();
  const expiryTimestamp = Date.now() + COOKIE_MAX_AGE_SECONDS * 1000;
  const sessionValue = signSession(userId, expiryTimestamp, secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionCookiePayload(): Promise<SessionPayload | null> {
  let secret: string;
  try {
    secret = getSessionSecret();
  } catch {
    return null;
  }
  
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  return verifyAndDecodeSession(sessionCookie, secret);
}
