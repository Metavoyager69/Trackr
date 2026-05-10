import { ProjectForm } from "@/components/project-form";
import { isDatabaseConfigured } from "@/lib/projects";

export default function CreateProjectPage() {
  const databaseConfigured = isDatabaseConfigured();

  return (
    <section className="create-layout">
      <div className="create-intro">
        <p className="section-label">Project Setup</p>
        <h1 className="page-title">New Project</h1>
        <p className="page-copy">
          Create a long-lived project record so reports can track planned,
          actual, and overall completion over time.
        </p>

        <div className="glass-panel create-status">
          <div className="summary-row">
            <span className="summary-label">Project Store</span>
            <span className="summary-value">
              {databaseConfigured ? "LIVE" : "HOLD"}
            </span>
          </div>
          <p className="muted-copy">
            {databaseConfigured
              ? "Projects are persisted in PostgreSQL and become selectable in new report entries."
              : "Configure DATABASE_URL before creating the first project."}
          </p>
        </div>
      </div>

      <ProjectForm databaseConfigured={databaseConfigured} />
    </section>
  );
}
