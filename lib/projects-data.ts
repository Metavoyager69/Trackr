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
import { requireCurrentUser, scopeQueryByOrganization, assertCanAccessProject, assertIsAdmin } from "./server/access-control";

export async function getProjects() {
  const user = await requireCurrentUser();
  const prisma = getPrismaClient();

  if (!prisma) {
    return [];
  }

  const scopedWhere = scopeQueryByOrganization(user);

  try {
    const projects = await prisma.project.findMany({
      where: scopedWhere,
      select: {
        id: true,
        organizationId: true,
        name: true,
        projectType: true,
        location: true,
        plannedDurationDays: true,
        goalSummary: true,
        projectPlanFileName: true,
        projectPlanMimeType: true,
        projectPlanUploadedAt: true,
        createdAt: true,
        updatedAt: true,
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
  const user = await requireCurrentUser();
  const prisma = getPrismaClient();

  if (!prisma) {
    return [];
  }

  const scopedWhere = scopeQueryByOrganization(user);

  try {
    return await prisma.project.findMany({
      where: scopedWhere,
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
  const user = await requireCurrentUser();
  await assertCanAccessProject(user, id, "read");
  
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
  const user = await requireCurrentUser();
  assertIsAdmin(user);

  const prisma = getPrismaClient();

  if (!prisma) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const project = await prisma.project.create({
    data: {
      ...toProjectCreateData(input),
      organizationId: user.organizationId
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

export async function updateProject(id: string, input: UpdateProjectInput) {
  const user = await requireCurrentUser();
  await assertCanAccessProject(user, id, "write");

  const prisma = getPrismaClient();

  if (!prisma) {
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
  const user = await requireCurrentUser();
  await assertCanAccessProject(user, id, "write");

  const prisma = getPrismaClient();

  if (!prisma) {
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
  const user = await requireCurrentUser();
  await assertCanAccessProject(user, id, "read");

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
  const user = await requireCurrentUser();
  await assertCanAccessProject(user, id, "write");

  const prisma = getPrismaClient();

  if (!prisma) {
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
