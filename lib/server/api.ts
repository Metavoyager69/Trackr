import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { authorizeApiRequest, type ApiScope } from "./auth";
import { getErrorMessage, getErrorStatus } from "./errors";
import { logError, logInfo } from "./logger";

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
    const response = await handler({ requestId });

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
