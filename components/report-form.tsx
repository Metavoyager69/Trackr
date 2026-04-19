"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Report, saveReport } from "@/lib/reports";

type FormState = {
  projectName: string;
  date: string;
  weather: string;
  crewSize: number;
  workCompleted: string;
  notes: string;
};

const initialFormState: FormState = {
  projectName: "",
  date: new Date().toISOString().slice(0, 10),
  weather: "",
  crewSize: 8,
  workCompleted: "",
  notes: ""
};

export function ReportForm() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(initialFormState);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setFormState((current) => ({
      ...current,
      [key]: value
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newReport: Report = {
      id: createReportId(formState.projectName),
      ...formState
    };

    saveReport(newReport);
    router.push(`/reports/${newReport.id}`);
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="field-grid">
        <div className="field">
          <label htmlFor="projectName">Project name</label>
          <input
            id="projectName"
            name="projectName"
            onChange={(event) => updateField("projectName", event.target.value)}
            placeholder="Central Plaza Tower"
            required
            value={formState.projectName}
          />
        </div>

        <div className="field">
          <label htmlFor="date">Report date</label>
          <input
            id="date"
            name="date"
            onChange={(event) => updateField("date", event.target.value)}
            required
            type="date"
            value={formState.date}
          />
        </div>

        <div className="field">
          <label htmlFor="weather">Weather</label>
          <input
            id="weather"
            name="weather"
            onChange={(event) => updateField("weather", event.target.value)}
            placeholder="Sunny"
            required
            value={formState.weather}
          />
        </div>

        <div className="field">
          <label htmlFor="crewSize">Crew size</label>
          <input
            id="crewSize"
            min={1}
            name="crewSize"
            onChange={(event) =>
              updateField("crewSize", Number(event.target.value))
            }
            required
            type="number"
            value={formState.crewSize}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="workCompleted">Work completed</label>
        <textarea
          id="workCompleted"
          name="workCompleted"
          onChange={(event) => updateField("workCompleted", event.target.value)}
          placeholder="Installed formwork for the second-floor slab."
          required
          value={formState.workCompleted}
        />
      </div>

      <div className="field">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          onChange={(event) => updateField("notes", event.target.value)}
          placeholder="Materials for tomorrow have been delivered."
          value={formState.notes}
        />
      </div>

      <p className="helper-text">
        Reports are saved in the browser for now to keep the example simple.
      </p>

      <div className="action-row">
        <button className="button button-primary" type="submit">
          Save Report
        </button>
      </div>
    </form>
  );
}

function createReportId(projectName: string) {
  const slug = projectName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug || "site-report"}-${Date.now()}`;
}
