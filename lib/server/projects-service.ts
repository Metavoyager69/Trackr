import "server-only";
import { ZodError } from "zod";
import {
  createProject,
  deleteProject,
  getProjectPlanAsset,
  getProjectById,
  getProjectOptions,
  getProjects,
  updateProject,
  updateProjectPlan
} from "@/lib/projects";
import { isDatabaseConfigured } from "@/lib/prisma";
import { mapDatabaseError } from "./db-errors";
import { AppConfigurationError, AppValidationError } from "./errors";
import { logError, logInfo } from "./logger";
import { projectInputSchema, projectPatchSchema } from "./validation";

export async function listProjects() {
  return getProjects();
}

export async function listProjectOptions() {
  return getProjectOptions();
}

export async function findProjectById(id: string) {
  return getProjectById(id);
}

export async function findProjectPlanAsset(id: string) {
  return getProjectPlanAsset(id);
}

export async function createProjectRecord(input: unknown) {
  assertDatabaseConfigured();

  try {
    const parsedInput = projectInputSchema.parse(input);
    const project = await createProject(parsedInput);

    logInfo("project.create", {
      projectId: project.id,
      reportCount: project.reportCount
    });

    return project;
  } catch (error) {
    logError("project.create_failed", {}, error);
    throw normalizeServiceError(error, "Could not create the project.");
  }
}

export async function updateProjectRecord(id: string, input: unknown) {
  assertDatabaseConfigured();

  try {
    const parsedInput = projectPatchSchema.parse(input);
    const project = await updateProject(id, parsedInput);

    logInfo("project.update", {
      projectId: project.id
    });

    return project;
  } catch (error) {
    logError("project.update_failed", { projectId: id }, error);
    throw normalizeServiceError(error, "Could not update the project.");
  }
}

export async function deleteProjectRecord(id: string) {
  assertDatabaseConfigured();

  try {
    await deleteProject(id);

    logInfo("project.delete", {
      projectId: id
    });
  } catch (error) {
    logError("project.delete_failed", { projectId: id }, error);
    throw normalizeServiceError(error, "Could not delete the project.");
  }
}

export async function uploadProjectPlanRecord(id: string, file: File) {
  assertDatabaseConfigured();

  if (file.size > 10 * 1024 * 1024) {
    throw new AppValidationError("Project plan file must be 10MB or less.");
  }

  if (!file.type) {
    throw new AppValidationError("Project plan file type could not be determined.");
  }

  const allowedMimeTypes = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/png",
    "image/jpeg",
    "text/plain"
  ]);

  if (!allowedMimeTypes.has(file.type)) {
    throw new AppValidationError(
      "Upload a PDF, Word document, Excel sheet, image, or text file."
    );
  }

  try {
    const arrayBuffer = (await file.arrayBuffer()) as ArrayBuffer;
    const fileData = new Uint8Array(arrayBuffer);
    const project = await updateProjectPlan(id, {
      fileName: file.name,
      mimeType: file.type,
      fileData
    });

    logInfo("project.plan_upload", {
      projectId: project.id,
      fileName: file.name,
      fileSize: file.size
    });

    return project;
  } catch (error) {
    logError("project.plan_upload_failed", { projectId: id }, error);
    throw normalizeServiceError(error, "Could not upload the project plan.");
  }
}

function assertDatabaseConfigured() {
  if (!isDatabaseConfigured()) {
    throw new AppConfigurationError(
      "Set DATABASE_URL before creating projects."
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
    conflict: "A project with this name already exists.",
    notFound: "Project not found."
  });
}
