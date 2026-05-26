"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getPrismaClient } from "@/lib/prisma";
import { hashPassword } from "@/lib/server/password";
import { createSessionCookie } from "@/lib/server/session";
import { MemberRole } from "@/lib/generated/prisma/client";
import { checkRateLimit, recordFailedAttempt } from "@/lib/server/rate-limit";

export type SignupFormState = { error?: string };

export async function signupAction(
  _prev: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const fullName = formData.get("fullName")?.toString().trim();
  const organizationName = formData.get("organizationName")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const inviteToken = formData.get("inviteToken")?.toString().trim();

  if (!fullName || !email || !password) {
    return { error: "Name, email, and password are required." };
  }

  if (!inviteToken && !organizationName) {
    return { error: "Organization name is required when creating a new workspace." };
  }

  const clientHeaders = await headers();
  const ip = clientHeaders.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const rateLimitKey = `signup:${ip}`;
  const limitCheck = checkRateLimit(rateLimitKey);
  if (!limitCheck.allowed) {
    return {
      error: `Too many signup attempts. Please try again in ${limitCheck.retryAfterSeconds} seconds.`
    };
  }

  if (password.length < 8) {
    recordFailedAttempt(rateLimitKey);
    return { error: "Password must be at least 8 characters." };
  }

  const prisma = getPrismaClient();
  if (!prisma) {
    return { error: "Database not configured." };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      recordFailedAttempt(rateLimitKey);
      return { error: "Email is already registered." };
    }

    const passwordHash = await hashPassword(password);
    let userId: string;

    if (inviteToken) {
      // Handle invitation flow
      const invite = await prisma.invitation.findUnique({ where: { token: inviteToken } });
      if (!invite || invite.accepted) {
        return { error: "Invalid or expired invitation." };
      }

      userId = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            passwordHash,
            fullName,
            memberships: {
              create: {
                organizationId: invite.organizationId,
                role: invite.role
              }
            }
          }
        });

        if (invite.projectId) {
          await tx.project.update({
            where: { id: invite.projectId },
            data: { viewers: { connect: { id: user.id } } }
          });
        }

        await tx.invitation.update({
          where: { id: invite.id },
          data: { accepted: true }
        });

        return user.id;
      });
    } else {
      // Handle new organization creation flow
      userId = await prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
          data: { name: organizationName! }
        });

        const user = await tx.user.create({
          data: {
            email,
            passwordHash,
            fullName,
            memberships: {
              create: {
                organizationId: org.id,
                role: MemberRole.ADMIN
              }
            }
          }
        });

        return user.id;
      });
    }

    await createSessionCookie(userId);
  } catch (error) {
    recordFailedAttempt(rateLimitKey);
    return { error: "An error occurred during registration." };
  }
  
  redirect("/dashboard");
}
