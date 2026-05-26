"use server";

import { redirect } from "next/navigation";
import { getPrismaClient } from "@/lib/prisma";
import { verifyPassword } from "@/lib/server/password";
import { createSessionCookie } from "@/lib/server/session";

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

  const prisma = getPrismaClient();
  if (!prisma) {
    return { error: "Database not configured." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Invalid email or password." };
  }

  await createSessionCookie(user.id);
  redirect("/dashboard");
}
