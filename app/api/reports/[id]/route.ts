import { NextResponse } from "next/server";
import { executeApiHandler } from "@/lib/server/api";
import {
  deleteReportRecord,
  findReportById,
  updateReportRecord
} from "@/lib/server/reports-service";

type ReportRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: ReportRouteProps
) {
  return executeApiHandler({
    request,
    route: "/api/reports/[id]",
    scope: "read",
    handler: async () => {
      const { id } = await params;
      const report = await findReportById(id);

      if (!report) {
        return NextResponse.json(
          { error: "Report not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({ report });
    }
  });
}

export async function PATCH(
  request: Request,
  { params }: ReportRouteProps
) {
  return executeApiHandler({
    request,
    route: "/api/reports/[id]",
    scope: "write",
    handler: async () => {
      const { id } = await params;
      const payload = await request.json();
      const report = await updateReportRecord(id, payload);

      return NextResponse.json({ report });
    }
  });
}

export async function DELETE(
  request: Request,
  { params }: ReportRouteProps
) {
  return executeApiHandler({
    request,
    route: "/api/reports/[id]",
    scope: "write",
    handler: async () => {
      const { id } = await params;
      await deleteReportRecord(id);

      return new NextResponse(null, { status: 204 });
    }
  });
}
