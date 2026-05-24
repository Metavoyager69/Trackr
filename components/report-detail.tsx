import Link from "next/link";
import type { Report } from "@/lib/reports";
import {
  getReportHeadline,
  getReportSubline,
  formatProgressValue,
  formatReportDate
} from "@/lib/reports";

type ReportDetailProps = {
  databaseConfigured: boolean;
  report: Report | null;
};

export function ReportDetail({
  databaseConfigured,
  report
}: ReportDetailProps) {
  if (!report) {
    return (
      <section className="dashboard-stack">
        <div className="empty-panel glass-panel">
          <h2>Report not found</h2>
          <p className="muted-copy">
            {databaseConfigured
              ? "This report could not be found in PostgreSQL."
              : "Set DATABASE_URL and run the Prisma migration before loading reports from the database."}
          </p>
          <div className="page-header-actions">
            <Link className="nav-button nav-button-secondary" href="/reports">
              Back to Reports
            </Link>
            <Link className="nav-button nav-button-primary" href="/reports/create">
              Create Report
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-stack">
      <div className="page-header">
        <div>
          <p className="section-label">Report Detail</p>
          <h1 className="page-title">{report.projectName}</h1>
          <p className="page-copy">{formatReportDate(report.date)} daily report.</p>
        </div>

        <div className="page-header-actions">
          <span className="status-pill status-pill-live">
            ID-{report.id.slice(-6).toUpperCase()}
          </span>
          <Link className="nav-button nav-button-secondary" href={`/projects/${report.projectId}`}>
            Open Project
          </Link>
          <Link className="nav-button nav-button-secondary" href="/reports">
            Back to Reports
          </Link>
        </div>
      </div>

      <div className="detail-layout">
        <article className="glass-panel detail-summary-card">
          <p className="section-label">Report Header</p>
          <h2 className="detail-heading">{getReportHeadline(report)}</h2>
          <p className="detail-summary">
            {report.summary?.trim()
              ? report.summary
              : "This report is being summarized from the work items below."}
          </p>
          <div className="detail-notes">
            <p className="helper-text">{getReportSubline(report)}</p>
            <p className="helper-text">{report.projectGoalSummary}</p>
          </div>
        </article>

        <div className="detail-meta-grid">
          <article className="surface-panel detail-meta-card">
            <span className="metric-label">Workers On Site</span>
            <span className="metric-value metric-value-small">
              {report.workersOnSite}
            </span>
          </article>

          <article className="surface-panel detail-meta-card">
            <span className="metric-label">Contractors On Site</span>
            <span className="metric-value metric-value-small">
              {report.contractorsOnSiteCount}
            </span>
          </article>

          <article className="surface-panel detail-meta-card">
            <span className="metric-label">Planned Progress</span>
            <span className="metric-value metric-value-small">
              {formatProgressValue(report.plannedProgressPct)}
            </span>
          </article>

          <article className="surface-panel detail-meta-card">
            <span className="metric-label">Actual Progress</span>
            <span className="metric-value metric-value-small">
              {formatProgressValue(report.actualProgressPct)}
            </span>
          </article>

          <article className="surface-panel detail-meta-card">
            <span className="metric-label">Variance</span>
            <span className="metric-value metric-value-small">
              {formatProgressValue(report.variancePct)}
            </span>
          </article>

          <article className="surface-panel detail-meta-card">
            <span className="metric-label">Completion</span>
            <span className="metric-value metric-value-small">
              {formatProgressValue(report.completionPct)}
            </span>
          </article>
        </div>
      </div>

      <section className="glass-panel work-items-panel">
        <div className="panel-heading">
          <p className="section-label">Work Items</p>
        </div>

        <div className="work-items-table">
          <div className="work-items-table-row work-items-table-head">
            <span>Contractor</span>
            <span>Work Done</span>
            <span>Engineer</span>
            <span>Location</span>
          </div>

          {report.workItems.map((workItem) => (
            <div className="work-items-table-row" key={workItem.id}>
              <span>{workItem.contractor}</span>
              <span>{workItem.workDescription}</span>
              <span>{workItem.engineerName}</span>
              <span>{workItem.location}</span>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
