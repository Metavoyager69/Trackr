import { findProjectPlanAsset } from "@/lib/server/projects-service";
import { isSignedIn } from "@/lib/server/session";

type ProjectPlanRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: ProjectPlanRouteProps
) {
  const signedIn = await isSignedIn();

  if (!signedIn) {
    return new Response("Sign in to download project plans.", { status: 401 });
  }

  const { id } = await params;
  const projectPlan = await findProjectPlanAsset(id);

  if (
    !projectPlan ||
    !projectPlan.projectPlanFileName ||
    !projectPlan.projectPlanMimeType ||
    !projectPlan.projectPlanFileData
  ) {
    return new Response("Project plan not found.", { status: 404 });
  }

  const fileName = encodeURIComponent(projectPlan.projectPlanFileName);

  return new Response(projectPlan.projectPlanFileData, {
    status: 200,
    headers: {
      "Content-Type": projectPlan.projectPlanMimeType,
      "Content-Disposition": `attachment; filename*=UTF-8''${fileName}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
