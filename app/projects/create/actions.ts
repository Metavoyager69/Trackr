"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getErrorMessage } from "@/lib/server/errors";
import { createProjectRecord } from "@/lib/server/projects-service";

export type CreateProjectFormState = {
  error: string | null;
};

export const initialCreateProjectFormState: CreateProjectFormState = {
  error: null
};

export async function createProjectAction(
  _previousState: CreateProjectFormState,
  formData: FormData
): Promise<CreateProjectFormState> {
  try {
    const project = await createProjectRecord({
      name: getFormValue(formData, "name"),
      goalSummary: getFormValue(formData, "goalSummary")
    });

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/reports/create");
    redirect(`/projects/${project.id}`);
  } catch (error) {
    return {
      error: getErrorMessage(error, "Could not create the project.")
    };
  }
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
