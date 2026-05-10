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
  const plannedProgressPct = parsePercentage(formData, "plannedProgressPct");
  const actualProgressPct = parsePercentage(formData, "actualProgressPct");
  const completionPct = parsePercentage(formData, "completionPct");

  if (!date || !projectId || !summary) {
    return {
      error: "Please fill in the project, date, and summary."
    };
  }

  if (
    plannedProgressPct === null ||
    actualProgressPct === null ||
    completionPct === null
  ) {
    return {
      error: "Progress values must be whole numbers from 0 to 100."
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
      plannedProgressPct,
      actualProgressPct,
      completionPct
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
  const value = getFormValue(formData, key);

  if (!/^\d+$/.test(value)) {
    return null;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (parsedValue < 0 || parsedValue > 100) {
    return null;
  }

  return parsedValue;
}
