import Link from "next/link";
import type { Report } from "@/lib/reports";
import {
  formatProgressValue,
  formatReportDate
} from "@/lib/reports";

type ReportListProps = {
  databaseConfigured: boolean;
  reports: Report[];
};

export function ReportList({
  databaseConfigured,
  reports
}: ReportListProps) {
  if (reports.length === 0) {
    return (
      <div className="empty-panel glass-panel">
        <h2>No reports yet</h2>
        <p className="muted-copy">
          {databaseConfigured
            ? "Create the first report and it will be saved to PostgreSQL."
            : "Set DATABASE_URL to load and save reports from PostgreSQL."}
        </p>
        <Link className="nav-button nav-button-primary" href="/reports/create">
          Create Report
        </Link>
      </div>
    );
  }

  return (
    <div className="report-ledger">
      {reports.map((report) => (
        <article className="glass-panel ledger-card" key={report.id}>
          <div className="ledger-top">
            <div>
              <p className="technical-caption">
                {report.projectName} - {formatReportDate(report.date)}
              </p>
              <h2 className="ledger-title">{report.summary}</h2>
            </div>
            <span className="status-pill status-pill-live">
              ID-{report.id.slice(-6).toUpperCase()}
            </span>
          </div>

          <p className="ledger-copy">{report.projectGoalSummary}</p>

          <div className="progress-card-grid">
            <div className="progress-stat">
              <span className="metric-label">Planned</span>
              <span className="progress-value">
                {formatProgressValue(report.plannedProgressPct)}
              </span>
            </div>
            <div className="progress-stat">
              <span className="metric-label">Actual</span>
              <span className="progress-value">
                {formatProgressValue(report.actualProgressPct)}
              </span>
            </div>
            <div className="progress-stat">
              <span className="metric-label">Variance</span>
              <span className="progress-value">
                {formatProgressValue(report.variancePct)}
              </span>
            </div>
            <div className="progress-stat">
              <span className="metric-label">Completion</span>
              <span className="progress-value">
                {formatProgressValue(report.completionPct)}
              </span>
            </div>
          </div>

          <div className="ledger-footer">
            <span className="activity-tag">Project Snapshot</span>
            <Link className="inline-link" href={`/reports/${report.id}`}>
              View Details
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
