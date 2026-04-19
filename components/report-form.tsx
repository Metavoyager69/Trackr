"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Report, createReportId, saveReport } from "@/lib/reports";

type FormState = {
  date: string;
  siteName: string;
  summary: string;
};

const initialFormState: FormState = {
  date: new Date().toISOString().slice(0, 10),
  siteName: "",
  summary: ""
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
      id: createReportId(formState.siteName),
      ...formState
    };

    saveReport(newReport);
    router.push(`/reports/${newReport.id}`);
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="field-grid">
        <div className="field">
          <label htmlFor="date">Date</label>
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
          <label htmlFor="siteName">Site name</label>
          <input
            id="siteName"
            name="siteName"
            onChange={(event) => updateField("siteName", event.target.value)}
            placeholder="Central Plaza Tower"
            required
            value={formState.siteName}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="summary">Summary text</label>
        <textarea
          id="summary"
          name="summary"
          onChange={(event) => updateField("summary", event.target.value)}
          placeholder="Summarize the work completed on site today."
          required
          value={formState.summary}
        />
      </div>

      <p className="helper-text">
        Reports are stored temporarily in your browser for now. No database is
        connected yet.
      </p>

      <div className="action-row">
        <button className="button button-primary" type="submit">
          Save Report
        </button>
      </div>
    </form>
  );
}
