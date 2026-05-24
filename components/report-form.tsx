"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
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
  const [workItems, setWorkItems] = useState([
    createEmptyWorkItem()
  ]);
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
        <label htmlFor="summary">Summary text (optional)</label>
        <textarea
          className="form-input form-textarea"
          disabled={isFormDisabled}
          id="summary"
          name="summary"
          placeholder="Optional high-level note for the day."
        />
      </div>

      <div className="field">
        <label htmlFor="workersOnSite">Workers on site</label>
        <input
          className="form-input"
          disabled={isFormDisabled}
          id="workersOnSite"
          min={0}
          name="workersOnSite"
          required
          step={1}
          type="number"
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

      <input
        name="workItemsJson"
        type="hidden"
        value={JSON.stringify(workItems)}
      />

      <div className="field">
        <div className="work-items-header">
          <div>
            <label>Work items table</label>
            <p className="helper-text">
              Log the contractor, work description, supervising engineer, and
              location for each activity row.
            </p>
          </div>
          <button
            className="nav-button nav-button-secondary"
            disabled={isFormDisabled}
            onClick={() => setWorkItems((currentItems) => [...currentItems, createEmptyWorkItem()])}
            type="button"
          >
            Add Row
          </button>
        </div>

        <div className="work-items-shell">
          <div className="work-items-grid work-items-grid-head">
            <span>Contractor</span>
            <span>Work Done</span>
            <span>Engineer</span>
            <span>Location</span>
            <span>Action</span>
          </div>

          {workItems.map((workItem, index) => (
            <div className="work-items-grid" key={index}>
              <input
                className="form-input"
                disabled={isFormDisabled}
                onChange={(event) =>
                  updateWorkItem(setWorkItems, index, "contractor", event.target.value)
                }
                placeholder="ABC Construction"
                type="text"
                value={workItem.contractor}
              />
              <input
                className="form-input"
                disabled={isFormDisabled}
                onChange={(event) =>
                  updateWorkItem(
                    setWorkItems,
                    index,
                    "workDescription",
                    event.target.value
                  )
                }
                placeholder="Excavation and blinding"
                type="text"
                value={workItem.workDescription}
              />
              <input
                className="form-input"
                disabled={isFormDisabled}
                onChange={(event) =>
                  updateWorkItem(setWorkItems, index, "engineerName", event.target.value)
                }
                placeholder="Engr. Adebayo"
                type="text"
                value={workItem.engineerName}
              />
              <input
                className="form-input"
                disabled={isFormDisabled}
                onChange={(event) =>
                  updateWorkItem(setWorkItems, index, "location", event.target.value)
                }
                placeholder="Zone A"
                type="text"
                value={workItem.location}
              />
              <button
                className="nav-button nav-button-secondary work-item-remove"
                disabled={isFormDisabled || workItems.length === 1}
                onClick={() =>
                  setWorkItems((currentItems) =>
                    currentItems.filter((_, itemIndex) => itemIndex !== index)
                  )
                }
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <p className="helper-text">
        Each report stores a dated project snapshot, workforce count, and a
        table of work activities for the day.
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

type WorkItemDraft = {
  contractor: string;
  workDescription: string;
  engineerName: string;
  location: string;
};

function createEmptyWorkItem(): WorkItemDraft {
  return {
    contractor: "",
    workDescription: "",
    engineerName: "",
    location: ""
  };
}

function updateWorkItem(
  setWorkItems: Dispatch<SetStateAction<WorkItemDraft[]>>,
  index: number,
  key: keyof WorkItemDraft,
  value: string
) {
  setWorkItems((currentItems) =>
    currentItems.map((workItem, itemIndex) =>
      itemIndex === index ? { ...workItem, [key]: value } : workItem
    )
  );
}
