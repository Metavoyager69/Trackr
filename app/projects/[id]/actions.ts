"use server";

import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/lib/server/errors";
import { uploadProjectPlanRecord } from "@/lib/server/projects-service";
import { requireCurrentUser } from "@/lib/server/access-control";
import type { UploadProjectPlanFormState } from "./form-state";

export async function uploadProjectPlanAction(
  projectId: string,
  _previousState: UploadProjectPlanFormState,
  formData: FormData
): Promise<UploadProjectPlanFormState> {
  try {
    await requireCurrentUser();
  } catch (error) {
    return {
      error: getErrorMessage(error, "Sign in to upload a project plan."),
      success: null
    };
  }

  const file = formData.get("projectPlan");

  if (!(file instanceof File) || file.size === 0) {
    return {
      error: "Select a project plan file before uploading.",
      success: null
    };
  }

  try {
    await uploadProjectPlanRecord(projectId, file);

    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);

    return {
      error: null,
      success: "Project plan uploaded successfully."
    };
  } catch (error) {
    return {
      error: getErrorMessage(error, "Could not upload the project plan."),
      success: null
    };
  }
}
