import "server-only";
import { ZodError } from "zod";
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjectOptions,
  getProjects,
  updateProject
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
