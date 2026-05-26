"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getErrorMessage } from "@/lib/server/errors";
import { createProjectRecord } from "@/lib/server/projects-service";
import { requireCurrentUser } from "@/lib/server/access-control";
import { getFormValue, parseWholeNumber } from "@/lib/form-utils";
import type { CreateProjectFormState } from "./form-state";

export async function createProjectAction(
  _previousState: CreateProjectFormState,
  formData: FormData
): Promise<CreateProjectFormState> {
  let projectId: string;
  try {
    await requireCurrentUser();

    const project = await createProjectRecord({
      name: getFormValue(formData, "name"),
      projectType: getFormValue(formData, "projectType"),
      location: getFormValue(formData, "location"),
      plannedDurationDays: parseWholeNumber(formData, "plannedDurationDays"),
      goalSummary: getFormValue(formData, "goalSummary")
    });

    projectId = project.id;

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/reports/create");
  } catch (error) {
    return {
      error: getErrorMessage(error, "Could not create the project.")
    };
  }

  redirect(`/projects/${projectId}`);
}


