import "server-only";
import { getPrismaClient } from "@/lib/prisma";
import { requireCurrentUser } from "./access-control";
import { MemberRole } from "@/lib/generated/prisma/client";

export type MemberSummary = {
  id: string;
  role: MemberRole;
  user: {
    fullName: string;
    email: string;
  };
};

export type InvitationSummary = {
  id: string;
  role: MemberRole;
  email: string;
  token: string;
};

export async function listMembers(): Promise<MemberSummary[]> {
  const user = await requireCurrentUser();
  const prisma = getPrismaClient();
  if (!prisma) return [];

  const memberships = await prisma.membership.findMany({
    where: { organizationId: user.organizationId },
    include: {
      user: {
        select: {
          fullName: true,
          email: true
        }
      }
    }
  });

  return memberships;
}

export async function listPendingInvitations(): Promise<InvitationSummary[]> {
  const user = await requireCurrentUser();
  const prisma = getPrismaClient();
  if (!prisma) return [];

  const invitations = await prisma.invitation.findMany({
    where: {
      organizationId: user.organizationId,
      accepted: false
    },
    select: {
      id: true,
      role: true,
      email: true,
      token: true
    }
  });

  return invitations;
}
