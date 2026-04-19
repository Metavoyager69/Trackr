"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  formatReportDate,
  getReportById,
  getSeedReportById,
  subscribeToReports
} from "@/lib/reports";

type ReportDetailProps = {
  reportId: string;
};

export function ReportDetail({ reportId }: ReportDetailProps) {
  const report = useSyncExternalStore(
    subscribeToReports,
    () => getReportById(reportId),
    () => getSeedReportById(reportId)
  );

  if (!report) {
    return (
      <section className="empty-state">
        <h2>Report not found</h2>
        <p className="muted">
          This report may have been removed or has not been created in this
          browser yet.
        </p>
        <div className="action-row">
          <Link className="button button-secondary" href="/reports">
            Back to Reports
          </Link>
          <Link className="button button-primary" href="/reports/create">
            Create Report
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">{formatReportDate(report.date)}</p>
          <h2>{report.siteName}</h2>
          <p className="section-intro">
            Review the site name, report date, and summary for this entry.
          </p>
        </div>
        <Link className="button button-secondary" href="/reports">
          Back to Reports
        </Link>
      </div>

      <article className="detail-card">
        <div className="detail-grid">
          <div className="detail-block">
            <span className="meta-label">Site Name</span>
            <p className="meta-value">{report.siteName}</p>
          </div>

          <div className="detail-block">
            <span className="meta-label">Date</span>
            <p className="meta-value">{formatReportDate(report.date)}</p>
          </div>

          <div className="detail-block detail-block-wide">
            <span className="meta-label">Summary</span>
            <p>{report.summary}</p>
          </div>
        </div>
      </article>
    </section>
  );
}
