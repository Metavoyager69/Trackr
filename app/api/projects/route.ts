import { NextResponse } from "next/server";
import { executeApiHandler } from "@/lib/server/api";
import {
  createProjectRecord,
  listProjects
} from "@/lib/server/projects-service";

export async function GET(request: Request) {
  return executeApiHandler({
    request,
    route: "/api/projects",
    scope: "read",
    handler: async () => {
      const projects = await listProjects();
      return NextResponse.json({ projects });
    }
  });
}

export async function POST(request: Request) {
  return executeApiHandler({
    request,
    route: "/api/projects",
    scope: "write",
    handler: async () => {
      const payload = await request.json();
      const project = await createProjectRecord(payload);

      return NextResponse.json({ project }, { status: 201 });
    }
  });
}
