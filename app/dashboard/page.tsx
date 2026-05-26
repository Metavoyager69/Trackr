import Link from "next/link";
import { getProjects } from "@/lib/projects";
import {
  getReports,
  getReportHeadline,
  formatProgressValue,
  isDatabaseConfigured
} from "@/lib/reports";
import { requireCurrentUser } from "@/lib/server/access-control";
import { getPrismaClient } from "@/lib/prisma";

export default async function HomePage() {
  const user = await requireCurrentUser();
  const projects = await getProjects();
  const reports = await getReports();
  const databaseConfigured = isDatabaseConfigured();
  const featuredProjects = projects.slice(0, 3);
  const recentReports = reports.slice(0, 4);
  const latestReport = reports[0] ?? null;
  const averageCompletion = getAverageCompletion(projects);

  const prisma = getPrismaClient();
  let members: any[] = [];
  let invites: any[] = [];
  
  if (prisma) {
    members = await prisma.membership.findMany({
      where: { organizationId: user.organizationId },
      include: { user: true }
    });
    invites = await prisma.invitation.findMany({
      where: { organizationId: user.organizationId, accepted: false }
    });
  }

  return (
    <section className="dashboard-stack">
      <header className="hero-grid">
        <div>
          <p className="section-label">{user.organizationName} Workspace</p>
          <h1 className="hero-title">Progress Grid</h1>
          <p className="hero-copy">
            Track each project against planned progress, actual progress, and
            final completion targets through dated daily reports.
          </p>
        </div>

        <div className="summary-rail">
          <div className="summary-row">
            <span className="summary-label">Total Active Projects</span>
            <span className="summary-value">
              {projects.length.toString().padStart(2, "0")}
            </span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Average Completion</span>
            <span className="summary-value">
              {formatProgressValue(averageCompletion)}
            </span>
          </div>
        </div>
      </header>

      <section className="cta-banner">
        <Link className="cta-banner-link" href="/reports/create">
          <span className="cta-kicker">Immediate Entry</span>
          <span className="cta-title">New Daily Report</span>
        </Link>
      </section>

      <div className="dashboard-layout">
        <section className="dashboard-main">
          <div className="panel-heading">
            <p className="section-label">Current Project Status</p>
          </div>

          <div className="glass-panel panel-stack">
            {featuredProjects.length > 0 ? (
              featuredProjects.map((project) => (
                <article className="activity-block" key={project.id}>
                  <div className="activity-header">
                    <div>
                      <p className="technical-caption">
                        {project.latestReportDate
                          ? `Latest update - ${compactDate(project.latestReportDate)}`
                          : "Awaiting first report"}
                      </p>
                      <h2 className="activity-title">{project.name}</h2>
                    </div>
                    <span className="activity-date">
                      {formatProgressValue(project.completionPct)}
                    </span>
                  </div>

                  <p className="panel-copy">{project.goalSummary}</p>

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

                  <div className="activity-footer">
                    <span className="activity-tag">Project Status</span>
                    <Link className="inline-link" href={`/projects/${project.id}`}>
                      Open Project
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-panel">
                <h2>No projects loaded</h2>
                <p className="muted-copy">
                  {databaseConfigured
                    ? "Create a project and start logging progress snapshots."
                    : "Set DATABASE_URL and run the migration to load live project data."}
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className="dashboard-side">
          {user.role === "ADMIN" && (
            <>
              <div className="panel-heading">
                <p className="section-label">Workspace Members</p>
              </div>
              <div className="glass-list mb-8">
                {members.map((m) => (
                  <div className="sidebar-item" key={m.id}>
                    <div className="sidebar-item-row">
                      <span className="technical-caption">{m.user.fullName}</span>
                      <span className="status-pill status-pill-live">{m.role}</span>
                    </div>
                    <p className="sidebar-copy">{m.user.email}</p>
                  </div>
                ))}
                {invites.map((inv) => (
                  <div className="sidebar-item" key={inv.id}>
                    <div className="sidebar-item-row">
                      <span className="technical-caption">Pending Invite</span>
                      <span className="status-pill status-pill-muted">{inv.role}</span>
                    </div>
                    <p className="sidebar-copy">{inv.email}</p>
                    <p className="sidebar-copy text-xs mt-1 font-mono">{inv.token}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="panel-heading">
            <p className="section-label">Recent Reports</p>
          </div>

          <div className="glass-list">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <Link
                  className="sidebar-item"
                  href={`/reports/${report.id}`}
                  key={report.id}
                >
                  <div className="sidebar-item-row">
                    <span className="technical-caption">
                      {compactDate(report.date)}
                    </span>
                    <span className="status-pill status-pill-live">
                      {formatProgressValue(report.completionPct)}
                    </span>
                  </div>
                  <h2 className="sidebar-title">{report.projectName}</h2>
                  <p className="sidebar-copy">
                    {truncate(getReportHeadline(report), 88)}
                  </p>
                </Link>
              ))
            ) : (
              <div className="sidebar-item">
                <div className="sidebar-item-row">
                  <span className="technical-caption">SYSTEM</span>
                  <span
                    className={`status-pill ${
                      databaseConfigured
                        ? "status-pill-live"
                        : "status-pill-muted"
                    }`}
                  >
                    {databaseConfigured ? "READY" : "WAITING"}
                  </span>
                </div>
                <h2 className="sidebar-title">Database Connection</h2>
                <p className="sidebar-copy">
                  {databaseConfigured
                    ? "PostgreSQL is configured. New reports will update project progress snapshots."
                    : "Add DATABASE_URL and run the Prisma migration to start using live storage."}
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <section className="metrics-grid">
        <article className="surface-panel metric-card">
          <span className="metric-label">Reports Logged</span>
          <div className="metric-value-row">
            <span className="metric-value">
              {reports.length.toString().padStart(2, "0")}
            </span>
            <span className="metric-meta">ARCHIVE</span>
          </div>
        </article>

        <article className="surface-panel metric-card">
          <span className="metric-label">Projects Tracked</span>
          <div className="metric-value-row">
            <span className="metric-value">
              {projects.length.toString().padStart(2, "0")}
            </span>
            <span className="metric-meta">ACTIVE</span>
          </div>
        </article>

        <article className="surface-panel metric-card">
          <span className="metric-label">Latest Sync</span>
          <div className="metric-value-row">
            <span className="metric-value metric-value-small">
              {latestReport ? compactDate(latestReport.date) : "NONE"}
            </span>
            <span className="metric-meta">FIELD</span>
          </div>
        </article>

        <article className="surface-panel metric-card">
          <span className="metric-label">Storage Status</span>
          <div className="metric-value-row">
            <span className="metric-value metric-value-small">
              {databaseConfigured ? "LIVE" : "SETUP"}
            </span>
            <span className="metric-meta">POSTGRES</span>
          </div>
        </article>
      </section>
    </section>
  );
}

function compactDate(date: string) {
  return date.split("-").reverse().join(".");
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

function getAverageCompletion(
  projects: Array<{ completionPct: number | null }>
) {
  const completionValues = projects
    .map((project) => project.completionPct)
    .filter((value): value is number => value !== null);

  if (completionValues.length === 0) {
    return null;
  }

  return Math.round(
    completionValues.reduce((total, value) => total + value, 0) /
      completionValues.length
  );
}
