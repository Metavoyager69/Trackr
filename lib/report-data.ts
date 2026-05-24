import "server-only";
import type { CreateReportInput } from "./report-types";
import { getPrismaClient, isDatabaseConfigured } from "./prisma";
import { serializeReport, toReportCreateData } from "./report-utils";

export async function getReports() {
  const prisma = getPrismaClient();

  if (!prisma) {
    return [];
  }

  const reports = await prisma.report.findMany({
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
}

export async function getReportById(id: string) {
  const prisma = getPrismaClient();

  if (!prisma) {
    return null;
  }

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
}

export async function createReport(input: CreateReportInput) {
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
