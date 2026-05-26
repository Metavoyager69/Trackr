"use server";

import { redirect } from "next/navigation";
import { getPrismaClient } from "@/lib/prisma";
import { verifyPassword } from "@/lib/server/password";
import { createSessionCookie } from "@/lib/server/session";
import { checkRateLimit, recordFailedAttempt } from "@/lib/server/rate-limit";

export type LoginFormState = { error?: string };

export async function loginAction(
  _prev: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const rateLimitKey = `login:${email}`;
  const limitCheck = checkRateLimit(rateLimitKey);
  if (!limitCheck.allowed) {
    return {
      error: `Too many login attempts. Please try again in ${limitCheck.retryAfterSeconds} seconds.`
    };
  }

  const prisma = getPrismaClient();
  if (!prisma) {
    return { error: "Database not configured." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    recordFailedAttempt(rateLimitKey);
    return { error: "Invalid email or password." };
  }

  await createSessionCookie(user.id);
  redirect("/dashboard");
}
