import { ReportDetail } from "@/components/report-detail";
import { getReportById, isDatabaseConfigured } from "@/lib/reports";

type ReportDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

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
