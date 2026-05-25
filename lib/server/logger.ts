type LogContext = Record<string, unknown>;

export function logInfo(event: string, context: LogContext = {}) {
  writeLog("INFO", event, context);
}

export function logWarn(event: string, context: LogContext = {}) {
  writeLog("WARN", event, context);
}

export function logError(
  event: string,
  context: LogContext = {},
  error?: unknown
) {
  writeLog("ERROR", event, {
    ...context,
    error: serializeError(error)
  });
}

function writeLog(level: "INFO" | "WARN" | "ERROR", event: string, context: LogContext) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...context
  };

  const message = JSON.stringify(payload);

  if (level === "ERROR") {
    console.error(message);
    return;
  }

  if (level === "WARN") {
    console.warn(message);
    return;
  }

  console.info(message);
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message
    };
  }

  return error ?? null;
}
