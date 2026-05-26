import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { authorizeApiRequest, type ApiScope } from "./auth";
import { getErrorMessage, getErrorStatus } from "./errors";
import { logError, logInfo } from "./logger";
import { apiContextStorage } from "./api-context";
import { MemberRole } from "@/lib/generated/prisma/client";

type ApiHandlerOptions = {
  request: Request;
  route: string;
  scope: ApiScope;
  handler: (context: { requestId: string }) => Promise<NextResponse>;
};

export async function executeApiHandler({
  request,
  route,
  scope,
  handler
}: ApiHandlerOptions) {
  const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();

  logInfo("api.request", {
    requestId,
    route,
    method: request.method,
    scope
  });

  try {
    authorizeApiRequest(request, scope);

    const orgId = process.env.SITELOG_API_ORG_ID || "seed-org-1";
    const apiUserContext = {
      id: "api-system-user",
      email: "api@sitelog.internal",
      fullName: "API System User",
      organizationId: orgId,
      organizationName: "API Organization",
      role: MemberRole.ADMIN
    };

    const response = await apiContextStorage.run(apiUserContext, () => handler({ requestId }));

    response.headers.set("x-request-id", requestId);

    logInfo("api.response", {
      requestId,
      route,
      method: request.method,
      status: response.status
    });

    return response;
  } catch (error) {
    const status = getErrorStatus(error);

    logError(
      "api.error",
      {
        requestId,
        route,
        method: request.method,
        status
      },
      error
    );

    return NextResponse.json(
      {
        error: getErrorMessage(error, "Unexpected server error."),
        requestId
      },
      {
        status,
        headers: {
          "x-request-id": requestId
        }
      }
    );
  }
}
