"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getErrorMessage } from "@/lib/server/errors";
import { createReportRecord } from "@/lib/server/reports-service";
import { requireCurrentUser } from "@/lib/server/access-control";
import type { CreateReportFormState } from "./form-state";

export async function createReportAction(
  _previousState: CreateReportFormState,
  formData: FormData
): Promise<CreateReportFormState> {
  let reportId: string;
  try {
    await requireCurrentUser();

    const report = await createReportRecord({
      projectId: getFormValue(formData, "projectId"),
      date: getFormValue(formData, "date"),
      summary: getFormValue(formData, "summary"),
      workersOnSite: parseWholeNumber(formData, "workersOnSite"),
      plannedProgressPct: parseWholeNumber(formData, "plannedProgressPct"),
      actualProgressPct: parseWholeNumber(formData, "actualProgressPct"),
      completionPct: parseWholeNumber(formData, "completionPct"),
      workItems: parseWorkItems(formData)
    });

    reportId = report.id;

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${report.projectId}`);
    revalidatePath("/reports");
    revalidatePath(`/reports/${report.id}`);
  } catch (error) {
    return {
      error: getErrorMessage(error, "Could not save the report.")
    };
  }

  redirect(`/reports/${reportId}`);
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseWholeNumber(formData: FormData, key: string) {
  const value = getFormValue(formData, key);

  if (!/^\d+$/.test(value)) {
    return Number.NaN;
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
