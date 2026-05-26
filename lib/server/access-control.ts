import "server-only";
import { getPrismaClient } from "@/lib/prisma";
import { getSessionCookiePayload } from "./session";
import { AppAuthError, AppConfigurationError } from "./errors";
import { MemberRole } from "@/lib/generated/prisma/client";
import { getApiContext } from "./api-context";

export type CurrentUserContext = {
  id: string;
  email: string;
  fullName: string;
  organizationId: string;
  organizationName: string;
  role: MemberRole;
};

export async function getCurrentUser(): Promise<CurrentUserContext | null> {
  const payload = await getSessionCookiePayload();
  if (!payload) {
    return getApiContext();
  }

  const prisma = getPrismaClient();
  if (!prisma) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      memberships: {
        include: {
          organization: true
        }
      }
    }
  });

  if (!user || user.memberships.length === 0) return null;

  // Assume primary membership is the first one
  const activeMembership = user.memberships[0];

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    organizationId: activeMembership.organizationId,
    organizationName: activeMembership.organization.name,
    role: activeMembership.role
  };
}

export async function requireCurrentUser(): Promise<CurrentUserContext> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppAuthError("Sign in to perform this action.");
  }
  return user;
}

export function assertIsAdmin(user: CurrentUserContext) {
  if (user.role !== MemberRole.ADMIN) {
    throw new AppAuthError("You do not have permission to perform this action.", 403);
  }
}

export function scopeQueryByOrganization(user: CurrentUserContext) {
  if (user.role === MemberRole.ADMIN) {
    return {
      organizationId: user.organizationId
    };
  }

  // VIEWER
  return {
    organizationId: user.organizationId,
    viewers: {
      some: {
        id: user.id
      }
    }
  };
}

export async function assertCanAccessProject(user: CurrentUserContext, projectId: string, action: "read" | "write") {
  if (action === "write") {
    assertIsAdmin(user);
  }

  const prisma = getPrismaClient();
  if (!prisma) throw new AppConfigurationError("Database is not configured.");

  const scopedWhere = scopeQueryByOrganization(user);
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...scopedWhere
    },
    select: { id: true }
  });

  if (!project) {
    throw new AppAuthError("Project not found or access denied.", 404);
  }
}

export async function assertCanAccessReport(user: CurrentUserContext, reportId: string, action: "read" | "write") {
  if (action === "write") {
    assertIsAdmin(user);
  }

  const prisma = getPrismaClient();
  if (!prisma) throw new AppConfigurationError("Database is not configured.");

  const scopedWhere = scopeQueryByOrganization(user);
  
  const report = await prisma.report.findFirst({
    where: {
      id: reportId,
      project: {
        ...scopedWhere
      }
    },
    select: { id: true }
  });

  if (!report) {
    throw new AppAuthError("Report not found or access denied.", 404);
  }
}
