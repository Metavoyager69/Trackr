import { NextResponse } from "next/server";
import { executeApiHandler } from "@/lib/server/api";
import {
  createReportRecord,
  listReports
} from "@/lib/server/reports-service";

export async function GET(request: Request) {
  return executeApiHandler({
    request,
    route: "/api/reports",
    scope: "read",
    handler: async () => {
      const reports = await listReports();
      return NextResponse.json({ reports });
    }
  });
}

export async function POST(request: Request) {
  return executeApiHandler({
    request,
    route: "/api/reports",
    scope: "write",
    handler: async () => {
      const payload = await request.json();
      const report = await createReportRecord(payload);

      return NextResponse.json({ report }, { status: 201 });
    }
  });
}
