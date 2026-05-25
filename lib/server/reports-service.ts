import "server-only";
import { ZodError } from "zod";
import {
  createReport,
  deleteReport,
  getReportById,
  getReports,
  updateReport
} from "@/lib/reports";
import { isDatabaseConfigured } from "@/lib/prisma";
import { mapDatabaseError } from "./db-errors";
import { AppConfigurationError, AppValidationError } from "./errors";
import { logError, logInfo } from "./logger";
import { reportInputSchema, reportPatchSchema } from "./validation";

export async function listReports() {
  return getReports();
}

export async function findReportById(id: string) {
  return getReportById(id);
}

export async function createReportRecord(input: unknown) {
  assertDatabaseConfigured();

  try {
    const parsedInput = reportInputSchema.parse(input);
    const report = await createReport(parsedInput);

    logInfo("report.create", {
      reportId: report.id,
      projectId: report.projectId,
      workItemCount: report.workItems.length
    });

    return report;
  } catch (error) {
    logError("report.create_failed", {}, error);
    throw normalizeServiceError(error, "Could not create the report.");
  }
}

export async function updateReportRecord(id: string, input: unknown) {
  assertDatabaseConfigured();

  try {
    const parsedInput = reportPatchSchema.parse(input);
    const report = await updateReport(id, parsedInput);

    logInfo("report.update", {
      reportId: report.id,
      projectId: report.projectId,
      workItemCount: report.workItems.length
    });

    return report;
  } catch (error) {
    logError("report.update_failed", { reportId: id }, error);
    throw normalizeServiceError(error, "Could not update the report.");
  }
}

export async function deleteReportRecord(id: string) {
  assertDatabaseConfigured();

  try {
    await deleteReport(id);

    logInfo("report.delete", {
      reportId: id
    });
  } catch (error) {
    logError("report.delete_failed", { reportId: id }, error);
    throw normalizeServiceError(error, "Could not delete the report.");
  }
}

function assertDatabaseConfigured() {
  if (!isDatabaseConfigured()) {
    throw new AppConfigurationError(
      "Set DATABASE_URL before saving reports to PostgreSQL."
    );
  }
}

function normalizeServiceError(error: unknown, fallbackMessage: string) {
  if (error instanceof ZodError) {
    return new AppValidationError(
      error.issues[0]?.message ?? fallbackMessage
    );
  }

  return mapDatabaseError(error, {
    notFound: "Report not found.",
    relation: "The referenced project was not found."
  });
}
