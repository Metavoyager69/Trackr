import "server-only";
import type { CreateReportInput, UpdateReportInput } from "./report-types";
import { getPrismaClient, isDatabaseConfigured } from "./prisma";
import { logError } from "./server/logger";
import {
  serializeReport,
  toReportCreateData,
  toReportUpdateData
} from "./report-utils";
import { requireCurrentUser, scopeQueryByOrganization, assertCanAccessReport, assertCanAccessProject } from "./server/access-control";

export async function getReports() {
  const user = await requireCurrentUser();
  const prisma = getPrismaClient();

  if (!prisma) {
    return [];
  }

  const scopedWhere = scopeQueryByOrganization(user);

  try {
    const reports = await prisma.report.findMany({
      where: {
        project: scopedWhere
      },
      include: {
        project: true,
        workItems: {
          orderBy: {
            createdAt: "asc"
          }
        }
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }]
    });

    return reports.map(serializeReport);
  } catch (error) {
    logError("reports.list_failed", {}, error);
    return [];
  }
}

export async function getReportById(id: string) {
  const user = await requireCurrentUser();
  await assertCanAccessReport(user, id, "read");

  const prisma = getPrismaClient();

  if (!prisma) {
    return null;
  }

  try {
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        project: true,
        workItems: {
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });

    return report ? serializeReport(report) : null;
  } catch (error) {
    logError("reports.get_failed", { reportId: id }, error);
    return null;
  }
}

export async function createReport(input: CreateReportInput) {
  const user = await requireCurrentUser();
  await assertCanAccessProject(user, input.projectId, "write");

  const prisma = getPrismaClient();

  if (!prisma || !isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const report = await prisma.report.create({
    data: toReportCreateData(input),
    include: {
      project: true,
      workItems: {
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  return serializeReport(report);
}

export async function updateReport(id: string, input: UpdateReportInput) {
  const user = await requireCurrentUser();
  await assertCanAccessReport(user, id, "write");

  const prisma = getPrismaClient();

  if (!prisma || !isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const report = await prisma.report.update({
    where: { id },
    data: toReportUpdateData(input),
    include: {
      project: true,
      workItems: {
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  return serializeReport(report);
}

export async function deleteReport(id: string) {
  const user = await requireCurrentUser();
  await assertCanAccessReport(user, id, "write");

  const prisma = getPrismaClient();

  if (!prisma || !isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  await prisma.report.delete({
    where: { id }
  });
}
