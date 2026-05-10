"use client";

import { useActionState } from "react";
import {
  createProjectAction,
  initialCreateProjectFormState
} from "@/app/projects/create/actions";

type ProjectFormProps = {
  databaseConfigured: boolean;
};

export function ProjectForm({ databaseConfigured }: ProjectFormProps) {
  const [state, formAction, isPending] = useActionState(
    createProjectAction,
    initialCreateProjectFormState
  );

  return (
    <form action={formAction} className="glass-panel form-shell">
      <div className="form-shell-header">
        <div>
          <p className="section-label">Project Registry</p>
          <h2 className="form-heading">Create Project Record</h2>
        </div>

        <span
          className={`status-pill ${
            databaseConfigured ? "status-pill-live" : "status-pill-muted"
          }`}
        >
          {databaseConfigured ? "POSTGRES READY" : "CONFIG REQUIRED"}
        </span>
      </div>

      <div className="field">
        <label htmlFor="name">Project name</label>
        <input
          className="form-input"
          disabled={!databaseConfigured}
          id="name"
          name="name"
          placeholder="Skyline North Foundation"
          required
          type="text"
        />
      </div>

      <div className="field">
        <label htmlFor="goalSummary">End goal summary</label>
        <textarea
          className="form-input form-textarea"
          disabled={!databaseConfigured}
          id="goalSummary"
          name="goalSummary"
          placeholder="Describe the intended completion target for this project."
          required
        />
      </div>

      <p className="helper-text">
        The goal summary anchors how daily completion is measured against the
        final intended outcome.
      </p>

      {state.error ? (
        <p aria-live="polite" className="helper-text form-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="form-actions">
        <button
          className="nav-button nav-button-primary form-submit"
          disabled={!databaseConfigured || isPending}
          type="submit"
        >
          {isPending ? "Creating..." : "Create Project"}
        </button>
      </div>
    </form>
  );
}
