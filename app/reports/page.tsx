import Link from "next/link";
import { ReportList } from "@/components/report-list";

export default function ReportsPage() {
  return (
    <section className="stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Reports</p>
          <h2>Daily site reports</h2>
          <p className="section-intro">
            Review recent site updates and open any report for more detail.
          </p>
        </div>
        <Link className="button button-primary" href="/reports/create">
          New Report
        </Link>
      </div>

      <ReportList />
    </section>
  );
}
