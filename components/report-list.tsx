"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  formatReportDate,
  getAllReports,
  getSeedReports,
  subscribeToReports
} from "@/lib/reports";

export function ReportList() {
  const reports = useSyncExternalStore(
    subscribeToReports,
    getAllReports,
    getSeedReports
  );

  if (reports.length === 0) {
    return (
      <div className="empty-state">
        <h3>No reports yet</h3>
        <p className="muted">
          Start by creating your first daily report for the job site.
        </p>
        <Link className="button button-primary" href="/reports/new">
          Create Report
        </Link>
      </div>
    );
  }

  return (
    <div className="reports-grid">
      {reports.map((report) => (
        <article className="report-card" key={report.id}>
          <p className="eyebrow">{formatReportDate(report.date)}</p>
          <h3>{report.projectName}</h3>
          <p className="muted">{report.workCompleted}</p>

          <div className="meta-row">
            <div className="meta-pill">
              <span className="meta-label">Weather</span>
              <span className="meta-value">{report.weather}</span>
            </div>
            <div className="meta-pill">
              <span className="meta-label">Crew Size</span>
              <span className="meta-value">{report.crewSize} workers</span>
            </div>
          </div>

          <Link className="button button-secondary" href={`/reports/${report.id}`}>
            View Details
          </Link>
        </article>
      ))}
    </div>
  );
}
