type LogLevel = "info" | "error";

interface LogPayload {
  event: string;
  level?: LogLevel;
  data?: Record<string, unknown>;
}

export function log({ event, level = "info", data = {} }: LogPayload) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...data
  };

  // eslint-disable-next-line no-console
  console[level](JSON.stringify(entry));
}

