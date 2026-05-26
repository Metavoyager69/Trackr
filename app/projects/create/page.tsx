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
          Create a detailed project record with project type, site location,
          intended duration, and an outcome description. Once the project is
          saved, the baseline project plan can be uploaded to the project so
          progress reports have a direct reference point.
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
              ? "Projects are persisted in PostgreSQL, become selectable in new report entries, and can store a baseline plan after creation."
              : "Configure DATABASE_URL before creating the first project."}
          </p>
        </div>
      </div>

      <ProjectForm databaseConfigured={databaseConfigured} />
    </section>
  );
}
