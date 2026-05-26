"use client";

import { useActionState } from "react";
import { uploadProjectPlanAction } from "@/app/projects/[id]/actions";
import { initialUploadProjectPlanFormState } from "@/app/projects/[id]/form-state";

type ProjectPlanUploadFormProps = {
  databaseConfigured: boolean;
  projectId: string;
};

export function ProjectPlanUploadForm({
  databaseConfigured,
  projectId
}: ProjectPlanUploadFormProps) {
  const uploadAction = uploadProjectPlanAction.bind(null, projectId);
  const [state, formAction, isPending] = useActionState(
    uploadAction,
    initialUploadProjectPlanFormState
  );

  return (
    <form action={formAction} className="glass-panel form-shell">
      <div className="form-shell-header">
        <div>
          <p className="section-label">Baseline Plan</p>
          <h2 className="form-heading">Upload Project Plan</h2>
        </div>

        <span
          className={`status-pill ${
            databaseConfigured ? "status-pill-live" : "status-pill-muted"
          }`}
        >
          {databaseConfigured ? "UPLOAD READY" : "CONFIG REQUIRED"}
        </span>
      </div>

      <p className="helper-text">
        Upload the approved baseline plan so the team can reference the original
        schedule or scope when comparing planned and actual progress.
      </p>

      <div className="field">
        <label htmlFor="projectPlan">Project plan file</label>
        <input
          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/png,image/jpeg,text/plain"
          className="form-input"
          disabled={!databaseConfigured || isPending}
          id="projectPlan"
          name="projectPlan"
          required
          type="file"
        />
        <p className="helper-text">
          Accepted formats: PDF, Word, Excel, PNG, JPEG, or plain text (max 10MB).
        </p>
      </div>

      {state.error ? (
        <p aria-live="polite" className="helper-text form-error" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p aria-live="polite" className="helper-text form-success" role="status">
          {state.success}
        </p>
      ) : null}

      <div className="form-actions">
        <button
          className="nav-button nav-button-primary form-submit"
          disabled={!databaseConfigured || isPending}
          type="submit"
        >
          {isPending ? "Uploading..." : "Upload Plan"}
        </button>
      </div>
    </form>
  );
}
