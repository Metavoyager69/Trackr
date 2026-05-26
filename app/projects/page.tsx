import Link from "next/link";
import { ProjectList } from "@/components/project-list";
import { getProjects } from "@/lib/projects";
import { isDatabaseConfigured } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | SiteLog",
  description: "Monitor all active projects and progress metrics"
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  const databaseConfigured = isDatabaseConfigured();

  return (
    <section className="dashboard-stack">
      <div className="page-header">
        <div>
          <p className="section-label">Projects</p>
          <h1 className="page-title">Progress Control</h1>
          <p className="page-copy">
            Monitor each project against planned progress, actual progress,
            planned duration, project type, site location, and final completion
            targets.
          </p>
        </div>
        <div className="page-header-actions">
          <span
            className={`status-pill ${
              databaseConfigured ? "status-pill-live" : "status-pill-muted"
            }`}
          >
            {databaseConfigured ? "DATABASE LIVE" : "DATABASE REQUIRED"}
          </span>
          <Link className="nav-button nav-button-secondary" href="/reports/create">
            New Report
          </Link>
          <Link className="nav-button nav-button-primary" href="/projects/create">
            New Project
          </Link>
        </div>
      </div>

      <ProjectList databaseConfigured={databaseConfigured} projects={projects} />
    </section>
  );
}
