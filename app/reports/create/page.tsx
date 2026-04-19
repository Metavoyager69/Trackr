import { ReportForm } from "@/components/report-form";

export default function CreateReportPage() {
  return (
    <section className="stack">
      <div>
        <p className="eyebrow">Create</p>
        <h2>Create a report</h2>
        <p className="section-intro">
          Add a simple site report with a date, site name, and summary text.
        </p>
      </div>

      <ReportForm />
    </section>
  );
}
