import { NextResponse } from "next/server";
import { executeApiHandler } from "@/lib/server/api";
import {
  deleteProjectRecord,
  findProjectById,
  updateProjectRecord
} from "@/lib/server/projects-service";

type ProjectRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: ProjectRouteProps
) {
  return executeApiHandler({
    request,
    route: "/api/projects/[id]",
    scope: "read",
    handler: async () => {
      const { id } = await params;
      const project = await findProjectById(id);

      if (!project) {
        return NextResponse.json(
          { error: "Project not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({ project });
    }
  });
}

export async function PATCH(
  request: Request,
  { params }: ProjectRouteProps
) {
  return executeApiHandler({
    request,
    route: "/api/projects/[id]",
    scope: "write",
    handler: async () => {
      const { id } = await params;
      const payload = await request.json();
      const project = await updateProjectRecord(id, payload);

      return NextResponse.json({ project });
    }
  });
}

export async function DELETE(
  request: Request,
  { params }: ProjectRouteProps
) {
  return executeApiHandler({
    request,
    route: "/api/projects/[id]",
    scope: "write",
    handler: async () => {
      const { id } = await params;
      await deleteProjectRecord(id);

      return new NextResponse(null, { status: 204 });
    }
  });
}
