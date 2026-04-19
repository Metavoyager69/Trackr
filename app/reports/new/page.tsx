import { ReportForm } from "@/components/report-form";

export default function NewReportPage() {
  return (
    <section className="stack">
      <div>
        <p className="eyebrow">Create</p>
        <h2>Create a daily report</h2>
        <p className="section-intro">
          Fill out the form below to add a new construction progress report.
        </p>
      </div>

      <ReportForm />
    </section>
  );
}
