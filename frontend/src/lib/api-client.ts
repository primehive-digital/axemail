export type ApiEnvelope<T> = {
  data: T;
};

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export function extractApiErrorMessage(payload: unknown, fallback = "Request failed.") {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const record = payload as Record<string, unknown>;

  if (typeof record.message === "string") {
    return record.message;
  }

  if (record.error && typeof record.error === "object") {
    const error = record.error as Record<string, unknown>;
    const detailMessage = extractValidationDetailMessage(error.details);

    if (detailMessage) {
      return detailMessage;
    }

    if (typeof error.message === "string") {
      return error.message;
    }
  }

  return fallback;
}

function extractValidationDetailMessage(details: unknown) {
  if (!details || typeof details !== "object") {
    return null;
  }

  const fieldErrors = (details as Record<string, unknown>).fieldErrors;
  if (!fieldErrors || typeof fieldErrors !== "object") {
    return null;
  }

  for (const [field, messages] of Object.entries(fieldErrors as Record<string, unknown>)) {
    if (Array.isArray(messages) && typeof messages[0] === "string") {
      return `${formatFieldName(field)}: ${messages[0]}`;
    }
  }

  return null;
}

function formatFieldName(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}
