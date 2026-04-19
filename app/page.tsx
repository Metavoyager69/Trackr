import Link from "next/link";

export default function HomePage() {
  return (
    <section className="hero">
      <p className="eyebrow">Construction Daily Reporting</p>
      <h1>Keep site updates simple and easy to review.</h1>
      <p className="lead">
        This starter app includes a reports list, a create report form, and a
        detail page so you can build on a clean beginner-friendly structure.
      </p>

      <div className="action-row">
        <Link className="button button-primary" href="/reports">
          View Reports
        </Link>
        <Link className="button button-secondary" href="/reports/create">
          Create a Report
        </Link>
      </div>
    </section>
  );
}
