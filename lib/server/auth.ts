import { timingSafeEqual } from "node:crypto";
import { AppAuthError, AppConfigurationError } from "./errors";

export type ApiScope = "read" | "write";

export function authorizeApiRequest(request: Request, scope: ApiScope) {
  const readToken = process.env.TRACKR_API_READ_TOKEN?.trim() ?? "";
  const writeToken = process.env.TRACKR_API_WRITE_TOKEN?.trim() ?? "";

  if (scope === "write" && !writeToken) {
    throw new AppConfigurationError(
      "Configure TRACKR_API_WRITE_TOKEN before exposing write API routes."
    );
  }

  if (scope === "read" && !readToken && !writeToken) {
    throw new AppConfigurationError(
      "Configure TRACKR_API_READ_TOKEN or TRACKR_API_WRITE_TOKEN before exposing API routes."
    );
  }

  const authorizationHeader = request.headers.get("authorization");

  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new AppAuthError("Missing bearer token.");
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();

  if (!token) {
    throw new AppAuthError("Missing bearer token.");
  }

  const canRead =
    (readToken && tokensMatch(token, readToken)) ||
    (writeToken && tokensMatch(token, writeToken));
  const canWrite = writeToken && tokensMatch(token, writeToken);

  if (scope === "read" && canRead) {
    return;
  }

  if (scope === "write" && canWrite) {
    return;
  }

  throw new AppAuthError("Invalid API token.", 403);
}

function tokensMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
