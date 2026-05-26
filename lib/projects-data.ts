import "server-only";
import type { CreateProjectInput, UpdateProjectInput } from "./project-types";
import { getPrismaClient, isDatabaseConfigured } from "./prisma";
import { logError } from "./server/logger";
import {
  serializeProjectDetail,
  serializeProjectSummary,
  toProjectCreateData,
  toProjectUpdateData
} from "./project-utils";

export async function getProjects() {
  const prisma = getPrismaClient();

  if (!prisma) {
    return [];
  }

  try {
    const projects = await prisma.project.findMany({
      include: {
        reports: {
          take: 1,
          orderBy: [{ date: "desc" }, { createdAt: "desc" }],
          include: {
            workItems: {
              orderBy: {
                createdAt: "asc"
              }
            }
          }
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
  } catch (error) {
    logError("projects.list_failed", {}, error);
    return [];
  }
}

export async function getProjectOptions() {
  const prisma = getPrismaClient();

  if (!prisma) {
    return [];
  }

  try {
    return await prisma.project.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: "asc"
      }
    });
  } catch (error) {
    logError("projects.options_failed", {}, error);
    return [];
  }
}

export async function getProjectById(id: string) {
  const prisma = getPrismaClient();

  if (!prisma) {
    return null;
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        reports: {
          orderBy: [{ date: "desc" }, { createdAt: "desc" }],
          include: {
            workItems: {
              orderBy: {
                createdAt: "asc"
              }
            }
          }
        }
      }
    });

    return project ? serializeProjectDetail(project) : null;
  } catch (error) {
    logError("projects.get_failed", { projectId: id }, error);
    return null;
  }
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
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        include: {
          workItems: {
            orderBy: {
              createdAt: "asc"
            }
          }
        }
      }
    }
  });

  return serializeProjectDetail(project);
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  const prisma = getPrismaClient();

  if (!prisma || !isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const project = await prisma.project.update({
    where: { id },
    data: toProjectUpdateData(input),
    include: {
      reports: {
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        include: {
          workItems: {
            orderBy: {
              createdAt: "asc"
            }
          }
        }
      }
    }
  });

  return serializeProjectDetail(project);
}

export async function updateProjectPlan(
  id: string,
  input: {
    fileName: string;
    mimeType: string;
    fileData: Uint8Array<ArrayBuffer>;
  }
) {
  const prisma = getPrismaClient();

  if (!prisma || !isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      projectPlanFileName: input.fileName,
      projectPlanMimeType: input.mimeType,
      projectPlanFileData: input.fileData,
      projectPlanUploadedAt: new Date()
    },
    include: {
      reports: {
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        include: {
          workItems: {
            orderBy: {
              createdAt: "asc"
            }
          }
        }
      }
    }
  });

  return serializeProjectDetail(project);
}

export async function getProjectPlanAsset(id: string) {
  const prisma = getPrismaClient();

  if (!prisma) {
    return null;
  }

  try {
    return await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        projectPlanFileName: true,
        projectPlanMimeType: true,
        projectPlanFileData: true,
        projectPlanUploadedAt: true
      }
    });
  } catch (error) {
    logError("projects.get_plan_failed", { projectId: id }, error);
    return null;
  }
}

export async function deleteProject(id: string) {
  const prisma = getPrismaClient();

  if (!prisma || !isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  await prisma.project.delete({
    where: { id }
  });
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
