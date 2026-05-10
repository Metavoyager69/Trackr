import "server-only";
import type { CreateProjectInput } from "./project-types";
import { getPrismaClient, isDatabaseConfigured } from "./prisma";
import {
  serializeProjectDetail,
  serializeProjectSummary,
  toProjectCreateData
} from "./project-utils";

export async function getProjects() {
  const prisma = getPrismaClient();

  if (!prisma) {
    return [];
  }

  const projects = await prisma.project.findMany({
    include: {
      reports: {
        take: 1,
        orderBy: [{ date: "desc" }, { createdAt: "desc" }]
      },
      _count: {
        select: {
          reports: true
        }
      }
    }
  });

  return projects
    .map(serializeProjectSummary)
    .sort(compareProjectsByLatestActivity);
}

export async function getProjectOptions() {
  const prisma = getPrismaClient();

  if (!prisma) {
    return [];
  }

  return prisma.project.findMany({
    select: {
      id: true,
      name: true
    },
    orderBy: {
      name: "asc"
    }
  });
}

export async function getProjectById(id: string) {
  const prisma = getPrismaClient();

  if (!prisma) {
    return null;
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      reports: {
        orderBy: [{ date: "desc" }, { createdAt: "desc" }]
      }
    }
  });

  return project ? serializeProjectDetail(project) : null;
}

export async function createProject(input: CreateProjectInput) {
  const prisma = getPrismaClient();

  if (!prisma || !isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const project = await prisma.project.create({
    data: toProjectCreateData(input),
    include: {
      reports: {
        orderBy: [{ date: "desc" }, { createdAt: "desc" }]
      }
    }
  });

  return serializeProjectDetail(project);
}

function compareProjectsByLatestActivity(
  first: Awaited<ReturnType<typeof serializeProjectSummary>>,
  second: Awaited<ReturnType<typeof serializeProjectSummary>>
) {
  const firstDate = first.latestReportDate ?? "";
  const secondDate = second.latestReportDate ?? "";

  if (firstDate !== secondDate) {
    return secondDate.localeCompare(firstDate);
  }

  return first.name.localeCompare(second.name);
}
