import Link from "next/link";
import type { ProjectSummary } from "@/lib/projects";
import { formatProgressValue, formatReportDate } from "@/lib/reports";

type ProjectListProps = {
  databaseConfigured: boolean;
  projects: ProjectSummary[];
};

export function ProjectList({
  databaseConfigured,
  projects
}: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="empty-panel glass-panel">
        <h2>No projects yet</h2>
        <p className="muted-copy">
          {databaseConfigured
            ? "Create the first project to start tracking planned vs actual progress."
            : "Set DATABASE_URL to load and save projects from PostgreSQL."}
        </p>
        <Link className="nav-button nav-button-primary" href="/projects/create">
          Create Project
        </Link>
      </div>
    );
  }

  return (
    <div className="project-grid">
      {projects.map((project) => (
        <article className="glass-panel project-card" key={project.id}>
          <div className="ledger-top">
            <div>
              <p className="technical-caption">
                {project.latestReportDate
                  ? `Latest update - ${formatReportDate(project.latestReportDate)}`
                  : "Awaiting first report"}
              </p>
              <h2 className="ledger-title">{project.name}</h2>
            </div>
            <span className="status-pill status-pill-live">
              {project.reportCount.toString().padStart(2, "0")} REPORTS
            </span>
          </div>

          <p className="ledger-copy">{project.goalSummary}</p>

          <div className="progress-card-grid">
            <div className="progress-stat">
              <span className="metric-label">Planned</span>
              <span className="progress-value">
                {formatProgressValue(project.plannedProgressPct)}
              </span>
            </div>
            <div className="progress-stat">
              <span className="metric-label">Actual</span>
              <span className="progress-value">
                {formatProgressValue(project.actualProgressPct)}
              </span>
            </div>
            <div className="progress-stat">
              <span className="metric-label">Variance</span>
              <span className="progress-value">
                {formatProgressValue(project.variancePct)}
              </span>
            </div>
            <div className="progress-stat">
              <span className="metric-label">Completion</span>
              <span className="progress-value">
                {formatProgressValue(project.completionPct)}
              </span>
            </div>
          </div>

          <div className="ledger-footer">
            <span className="activity-tag">Project Status</span>
            <Link className="inline-link" href={`/projects/${project.id}`}>
              Open Project
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
