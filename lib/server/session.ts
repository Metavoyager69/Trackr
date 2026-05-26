import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { AppAuthError, AppConfigurationError } from "./errors";

const COOKIE_NAME = "trackr_session";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8;

function readAdminToken() {
  return process.env.TRACKR_ADMIN_TOKEN?.trim() ?? "";
}

function requireAdminToken() {
  const token = readAdminToken();

  if (!token) {
    throw new AppConfigurationError(
      "Set TRACKR_ADMIN_TOKEN before using the app."
    );
  }

  return token;
}

function tokensMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function signSession(expiryTimestamp: number, adminToken: string): string {
  const payload = expiryTimestamp.toString();
  const signature = createHmac("sha256", adminToken).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

function verifySession(cookieValue: string, adminToken: string): boolean {
  const dotIndex = cookieValue.indexOf(".");
  if (dotIndex === -1) {
    return false;
  }

  const payload = cookieValue.slice(0, dotIndex);
  const signature = cookieValue.slice(dotIndex + 1);

  const expectedSignature = createHmac("sha256", adminToken).update(payload).digest("hex");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  const match = timingSafeEqual(sigBuffer, expectedBuffer);
  if (!match) {
    return false;
  }

  const expiryTimestamp = Number(payload);
  if (Number.isNaN(expiryTimestamp)) {
    return false;
  }

  return expiryTimestamp > Date.now();
}

export async function authorizeServerAction() {
  const adminToken = requireAdminToken();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value ?? "";

  if (!sessionCookie || !verifySession(sessionCookie, adminToken)) {
    throw new AppAuthError("Sign in to perform this action.");
  }
}

export async function isSignedIn(): Promise<boolean> {
  const adminToken = readAdminToken();

  if (!adminToken) {
    return false;
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value ?? "";

  return Boolean(sessionCookie) && verifySession(sessionCookie, adminToken);
}

export async function createSessionCookie(submittedToken: string) {
  const adminToken = requireAdminToken();

  if (!tokensMatch(submittedToken, adminToken)) {
    throw new AppAuthError("Invalid admin token.");
  }

  const expiryTimestamp = Date.now() + COOKIE_MAX_AGE_SECONDS * 1000;
  const sessionValue = signSession(expiryTimestamp, adminToken);

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
