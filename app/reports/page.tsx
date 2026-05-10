import Link from "next/link";
import { ReportList } from "@/components/report-list";
import { getReports, isDatabaseConfigured } from "@/lib/reports";

export default async function ReportsPage() {
  const reports = await getReports();
  const databaseConfigured = isDatabaseConfigured();

  return (
    <section className="dashboard-stack">
      <div className="page-header">
        <div>
          <p className="section-label">Archive</p>
          <h1 className="page-title">Report Ledger</h1>
          <p className="page-copy">
            Browse every logged project snapshot, including planned progress,
            actual progress, and overall completion values.
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
          <Link className="nav-button nav-button-secondary" href="/projects">
            Projects
          </Link>
          <Link className="nav-button nav-button-primary" href="/reports/create">
            New Report
          </Link>
        </div>
      </div>

      <ReportList databaseConfigured={databaseConfigured} reports={reports} />
    </section>
  );
}
