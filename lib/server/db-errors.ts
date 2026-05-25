import { Prisma } from "@/lib/generated/prisma/client";
import {
  AppConflictError,
  AppNotFoundError,
  AppValidationError
} from "./errors";

type DatabaseErrorMessages = {
  conflict?: string;
  notFound?: string;
  relation?: string;
};

export function mapDatabaseError(
  error: unknown,
  messages: DatabaseErrorMessages = {}
) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return error instanceof Error ? error : new Error("Database request failed.");
  }

  switch (error.code) {
    case "P2002":
      return new AppConflictError(
        messages.conflict ?? "A record with this value already exists."
      );
    case "P2003":
      return new AppValidationError(
        messages.relation ?? "A related record was not found or is invalid."
      );
    case "P2025":
      return new AppNotFoundError(
        messages.notFound ?? "The requested record was not found."
      );
    default:
      return error;
  }
}
