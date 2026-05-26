"use server";

import { redirect } from "next/navigation";
import { clearSessionCookie } from "@/lib/server/session";

export async function signOutAction() {
  await clearSessionCookie();
  redirect("/login");
}
