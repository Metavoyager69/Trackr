"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getErrorMessage } from "@/lib/server/errors";
import { checkRateLimit, recordFailedAttempt } from "@/lib/server/rate-limit";
import { createSessionCookie } from "@/lib/server/session";
import type { SignInFormState } from "./form-state";

export async function signInAction(
  _previousState: SignInFormState,
  formData: FormData
): Promise<SignInFormState> {
  const clientIp = await getClientIp();
  const { allowed, retryAfterSeconds } = checkRateLimit(clientIp);

  if (!allowed) {
    return {
      error: `Too many sign-in attempts. Try again in ${retryAfterSeconds} seconds.`
    };
  }

  const tokenValue = formData.get("token");
  const submittedToken =
    typeof tokenValue === "string" ? tokenValue.trim() : "";

  if (!submittedToken) {
    return { error: "Enter the admin token." };
  }

  try {
    await createSessionCookie(submittedToken);
  } catch (error) {
    recordFailedAttempt(clientIp);
    return {
      error: getErrorMessage(error, "Could not sign in.")
    };
  }

  redirect("/");
}

async function getClientIp() {
  const headerStore = await headers();
  return headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}