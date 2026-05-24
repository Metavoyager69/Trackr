import Link from "next/link";
import type { ProjectDetail as ProjectDetailType } from "@/lib/projects";
import {
  getReportHeadline,
  formatProgressValue,
  formatReportDate
} from "@/lib/reports";

type ProjectDetailProps = {
  databaseConfigured: boolean;
  project: ProjectDetailType | null;
};

export function ProjectDetail({
  databaseConfigured,
  project
}: ProjectDetailProps) {
  if (!project) {
    return (
      <section className="dashboard-stack">
        <div className="empty-panel glass-panel">
          <h2>Project not found</h2>
          <p className="muted-copy">
            {databaseConfigured
              ? "This project could not be found in PostgreSQL."
              : "Set DATABASE_URL and run the Prisma migration before loading projects from the database."}
          </p>
          <div className="page-header-actions">
            <Link className="nav-button nav-button-secondary" href="/projects">
              Back to Projects
            </Link>
            <Link className="nav-button nav-button-primary" href="/projects/create">
              Create Project
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
          <p className="section-label">Project Detail</p>
          <h1 className="page-title">{project.name}</h1>
          <p className="page-copy">{project.goalSummary}</p>
        </div>

        <div className="page-header-actions">
          <span className="status-pill status-pill-live">
            {project.reportCount.toString().padStart(2, "0")} REPORTS
          </span>
          <Link className="nav-button nav-button-secondary" href="/reports/create">
            New Report
          </Link>
          <Link className="nav-button nav-button-secondary" href="/projects">
            Back to Projects
          </Link>
        </div>
      </div>

      <section className="metrics-grid metrics-grid-three">
        <article className="surface-panel metric-card">
          <span className="metric-label">Planned Progress</span>
          <div className="metric-value-row">
            <span className="metric-value metric-value-small">
              {formatProgressValue(project.plannedProgressPct)}
            </span>
            <span className="metric-meta">TARGET</span>
          </div>
        </article>
        <article className="surface-panel metric-card">
          <span className="metric-label">Actual Progress</span>
          <div className="metric-value-row">
            <span className="metric-value metric-value-small">
              {formatProgressValue(project.actualProgressPct)}
            </span>
            <span className="metric-meta">FIELD</span>
          </div>
        </article>
        <article className="surface-panel metric-card">
          <span className="metric-label">Variance</span>
          <div className="metric-value-row">
            <span className="metric-value metric-value-small">
              {formatProgressValue(project.variancePct)}
            </span>
            <span className="metric-meta">DELTA</span>
          </div>
        </article>
        <article className="surface-panel metric-card">
          <span className="metric-label">Completion</span>
          <div className="metric-value-row">
            <span className="metric-value metric-value-small">
              {formatProgressValue(project.completionPct)}
            </span>
            <span className="metric-meta">GOAL</span>
          </div>
        </article>
        <article className="surface-panel metric-card">
          <span className="metric-label">Latest Update</span>
          <div className="metric-value-row">
            <span className="metric-value metric-value-small">
              {project.latestReportDate
                ? formatReportDate(project.latestReportDate)
                : "N/A"}
            </span>
            <span className="metric-meta">DATE</span>
          </div>
        </article>
        <article className="surface-panel metric-card">
          <span className="metric-label">Archive Count</span>
          <div className="metric-value-row">
            <span className="metric-value metric-value-small">
              {project.reportCount.toString().padStart(2, "0")}
            </span>
            <span className="metric-meta">LOGS</span>
          </div>
        </article>
      </section>

      <section className="dashboard-side">
        <div className="panel-heading">
          <p className="section-label">Recent Reports</p>
        </div>

        <div className="glass-list">
          {project.recentReports.length > 0 ? (
            project.recentReports.map((report) => (
              <Link
                className="sidebar-item"
                href={`/reports/${report.id}`}
                key={report.id}
              >
                <div className="sidebar-item-row">
                  <span className="technical-caption">
                    {formatReportDate(report.date)}
                  </span>
                  <span className="status-pill status-pill-live">
                    {formatProgressValue(report.completionPct)}
                  </span>
                </div>
                <h2 className="sidebar-title">{getReportHeadline(report)}</h2>
                <p className="sidebar-copy">
                  Planned {formatProgressValue(report.plannedProgressPct)} - Actual{" "}
                  {formatProgressValue(report.actualProgressPct)} - Variance{" "}
                  {formatProgressValue(report.variancePct)}
                </p>
              </Link>
            ))
          ) : (
            <div className="sidebar-item">
              <div className="sidebar-item-row">
                <span className="technical-caption">STATUS</span>
                <span className="status-pill status-pill-muted">NO LOGS</span>
              </div>
              <h2 className="sidebar-title">No daily reports yet</h2>
              <p className="sidebar-copy">
                Create the first project report to begin tracking planned
                progress against actual execution.
              </p>
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
