import { getProjectOptions } from "@/lib/projects";
import { isDatabaseConfigured } from "@/lib/reports";
import { ReportForm } from "@/components/report-form";

export default async function CreateReportPage() {
  const databaseConfigured = isDatabaseConfigured();
  const projects = await getProjectOptions();

  return (
    <section className="create-layout">
      <div className="create-intro">
        <p className="section-label">Field Input</p>
        <h1 className="page-title">New Report</h1>
        <p className="page-copy">
          Capture a dated project snapshot with planned progress, actual
          progress, and overall completion.
        </p>

        <div className="glass-panel create-status">
          <div className="summary-row">
            <span className="summary-label">Capture Mode</span>
            <span className="summary-value">
              {databaseConfigured ? "LIVE" : "HOLD"}
            </span>
          </div>
          <p className="muted-copy">
            {databaseConfigured
              ? "Submissions write directly to PostgreSQL and update project history."
              : "Configure DATABASE_URL before sending the first production report."}
          </p>
        </div>
      </div>

      <ReportForm
        databaseConfigured={databaseConfigured}
        projects={projects}
      />
    </section>
  );
}
