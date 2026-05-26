import { ReportDetail } from "@/components/report-detail";
import { getReportById } from "@/lib/reports";
import { isDatabaseConfigured } from "@/lib/prisma";
import type { Metadata } from "next";

type ReportDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params
}: ReportDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const report = await getReportById(id);
  return {
    title: report ? `Report - ${report.projectName} (${report.date}) | SiteLog` : "Report Detail | SiteLog",
    description: report ? report.summary : "View report detail"
  };
}

export default async function ReportDetailPage({
  params
}: ReportDetailPageProps) {
  const { id } = await params;
  const report = await getReportById(id);
  const databaseConfigured = isDatabaseConfigured();

  return (
    <ReportDetail
      databaseConfigured={databaseConfigured}
      report={report}
    />
  );
}
