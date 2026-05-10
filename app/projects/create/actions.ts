"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createProject, isDatabaseConfigured } from "@/lib/projects";

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
  const name = getFormValue(formData, "name");
  const goalSummary = getFormValue(formData, "goalSummary");

  if (!name || !goalSummary) {
    return {
      error: "Please fill in the project name and goal summary."
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      error: "Set DATABASE_URL before creating projects."
    };
  }

  try {
    const project = await createProject({
      name,
      goalSummary
    });

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/reports/create");
    redirect(`/projects/${project.id}`);
  } catch {
    return {
      error: "Could not create the project."
    };
  }
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
