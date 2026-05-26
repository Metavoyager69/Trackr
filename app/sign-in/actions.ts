"use server";

import { redirect } from "next/navigation";
import { getErrorMessage } from "@/lib/server/errors";
import { createSessionCookie } from "@/lib/server/session";
import type { SignInFormState } from "./form-state";

export async function signInAction(
  _previousState: SignInFormState,
  formData: FormData
): Promise<SignInFormState> {
  const tokenValue = formData.get("token");
  const submittedToken =
    typeof tokenValue === "string" ? tokenValue.trim() : "";

  if (!submittedToken) {
    return { error: "Enter the admin token." };
  }

  try {
    await createSessionCookie(submittedToken);
  } catch (error) {
    return {
      error: getErrorMessage(error, "Could not sign in.")
    };
  }

  redirect("/");
}