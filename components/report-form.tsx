"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ProjectOption } from "@/lib/projects";
import {
  createReportAction,
  initialCreateReportFormState
} from "@/app/reports/create/actions";

type ReportFormProps = {
  databaseConfigured: boolean;
  projects: ProjectOption[];
};

export function ReportForm({
  databaseConfigured,
  projects
}: ReportFormProps) {
  const [state, formAction, isPending] = useActionState(
    createReportAction,
    initialCreateReportFormState
  );
  const isFormDisabled = !databaseConfigured || projects.length === 0;

  return (
    <form action={formAction} className="glass-panel form-shell">
      <div className="form-shell-header">
        <div>
          <p className="section-label">Input Console</p>
          <h2 className="form-heading">Log Daily Activity</h2>
        </div>

        <span
          className={`status-pill ${
            databaseConfigured ? "status-pill-live" : "status-pill-muted"
          }`}
        >
          {databaseConfigured ? "POSTGRES READY" : "CONFIG REQUIRED"}
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="inline-notice">
          <p className="helper-text">
            Create a project before logging daily progress.
          </p>
          <Link className="inline-link" href="/projects/create">
            Create Project
          </Link>
        </div>
      ) : null}

      <div className="field-grid">
        <div className="field">
          <label htmlFor="projectId">Project</label>
          <select
            className="form-input"
            defaultValue={projects[0]?.id ?? ""}
            disabled={isFormDisabled}
            id="projectId"
            name="projectId"
            required
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="date">Date</label>
          <input
            className="form-input"
            defaultValue={new Date().toISOString().slice(0, 10)}
            disabled={isFormDisabled}
            id="date"
            name="date"
            required
            type="date"
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="summary">Summary text</label>
        <textarea
          className="form-input form-textarea"
          disabled={isFormDisabled}
          id="summary"
          name="summary"
          placeholder="Summarize the work completed on site today."
          required
        />
      </div>

      <div className="progress-input-grid">
        <div className="field">
          <label htmlFor="plannedProgressPct">Planned progress %</label>
          <input
            className="form-input"
            disabled={isFormDisabled}
            id="plannedProgressPct"
            max={100}
            min={0}
            name="plannedProgressPct"
            required
            step={1}
            type="number"
          />
        </div>

        <div className="field">
          <label htmlFor="actualProgressPct">Actual progress %</label>
          <input
            className="form-input"
            disabled={isFormDisabled}
            id="actualProgressPct"
            max={100}
            min={0}
            name="actualProgressPct"
            required
            step={1}
            type="number"
          />
        </div>

        <div className="field">
          <label htmlFor="completionPct">Overall completion %</label>
          <input
            className="form-input"
            disabled={isFormDisabled}
            id="completionPct"
            max={100}
            min={0}
            name="completionPct"
            required
            step={1}
            type="number"
          />
        </div>
      </div>

      <p className="helper-text">
        Each report stores a dated snapshot of planned, actual, and overall
        project completion percentages.
      </p>

      {state.error ? (
        <p aria-live="polite" className="helper-text form-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="form-actions">
        <button
          className="nav-button nav-button-primary form-submit"
          disabled={isPending || isFormDisabled}
          type="submit"
        >
          {isPending ? "Saving..." : "Save Report"}
        </button>
      </div>
    </form>
  );
}
