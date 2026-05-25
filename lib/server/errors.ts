export class AppValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppValidationError";
  }
}

export class AppConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppConfigurationError";
  }
}

export class AppAuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = "AppAuthError";
    this.status = status;
  }
}

export class AppConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppConflictError";
  }
}

export class AppNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppNotFoundError";
  }
}

export function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export function getErrorStatus(error: unknown) {
  if (error instanceof AppValidationError) {
    return 400;
  }

  if (error instanceof AppAuthError) {
    return error.status;
  }

  if (error instanceof AppConflictError) {
    return 409;
  }

  if (error instanceof AppNotFoundError) {
    return 404;
  }

  if (error instanceof AppConfigurationError) {
    return 503;
  }

  return 500;
}
