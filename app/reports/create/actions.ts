"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createReport, isDatabaseConfigured } from "@/lib/reports";

export type CreateReportFormState = {
  error: string | null;
};

export const initialCreateReportFormState: CreateReportFormState = {
  error: null
};

export async function createReportAction(
  _previousState: CreateReportFormState,
  formData: FormData
): Promise<CreateReportFormState> {
  const date = getFormValue(formData, "date");
  const projectId = getFormValue(formData, "projectId");
  const summary = getFormValue(formData, "summary");
  const workersOnSite = parseWholeNumber(formData, "workersOnSite");
  const plannedProgressPct = parsePercentage(formData, "plannedProgressPct");
  const actualProgressPct = parsePercentage(formData, "actualProgressPct");
  const completionPct = parsePercentage(formData, "completionPct");
  const workItems = parseWorkItems(formData);

  if (!date || !projectId) {
    return {
      error: "Please fill in the project and date."
    };
  }

  if (
    workersOnSite === null ||
    plannedProgressPct === null ||
    actualProgressPct === null ||
    completionPct === null
  ) {
    return {
      error: "Workers on site and progress values must be whole numbers."
    };
  }

  if (workersOnSite < 0) {
    return {
      error: "Workers on site cannot be negative."
    };
  }

  if (workItems.length === 0) {
    return {
      error: "Add at least one work item to the daily report."
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      error: "Set DATABASE_URL before saving reports to PostgreSQL."
    };
  }

  try {
    const report = await createReport({
      projectId,
      date,
      summary,
      workersOnSite,
      plannedProgressPct,
      actualProgressPct,
      completionPct,
      workItems
    });

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${report.projectId}`);
    revalidatePath("/reports");
    revalidatePath(`/reports/${report.id}`);
    redirect(`/reports/${report.id}`);
  } catch {
    return {
      error: "Could not save the report to the database."
    };
  }
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parsePercentage(formData: FormData, key: string) {
  const parsedValue = parseWholeNumber(formData, key);

  if (parsedValue === null || parsedValue < 0 || parsedValue > 100) {
    return null;
  }

  return parsedValue;
}

function parseWholeNumber(formData: FormData, key: string) {
  const value = getFormValue(formData, key);

  if (!/^\d+$/.test(value)) {
    return null;
  }

  return Number.parseInt(value, 10);
}

function parseWorkItems(formData: FormData) {
  const rawValue = getFormValue(formData, "workItemsJson");

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .map((workItem) => ({
        contractor:
          typeof workItem?.contractor === "string"
            ? workItem.contractor.trim()
            : "",
        workDescription:
          typeof workItem?.workDescription === "string"
            ? workItem.workDescription.trim()
            : "",
        engineerName:
          typeof workItem?.engineerName === "string"
            ? workItem.engineerName.trim()
            : "",
        location:
          typeof workItem?.location === "string"
            ? workItem.location.trim()
            : ""
      }))
      .filter(
        (workItem) =>
          workItem.contractor &&
          workItem.workDescription &&
          workItem.engineerName &&
          workItem.location
      );
  } catch {
    return [];
  }
}
