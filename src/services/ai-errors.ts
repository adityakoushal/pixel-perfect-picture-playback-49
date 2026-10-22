export type PlanErrorCode =
  | "not_configured"
  | "rate_limited"
  | "credits"
  | "forbidden"
  | "invalid_output"
  | "invalid_input"
  | "unavailable";

export interface PlanError {
  code: PlanErrorCode;
  message: string;
  retryable: boolean;
}

/** Maps an AI gateway HTTP status to a user-safe error. */
export function mapGatewayStatus(status: number | undefined): PlanError {
  if (status === 429)
    return { code: "rate_limited", message: "The AI planner is busy right now. Please try again in a minute.", retryable: true };
  if (status === 402)
    return { code: "credits", message: "AI credits have run out for this app. You can use demo mode meanwhile.", retryable: false };
  if (status === 401)
    return { code: "not_configured", message: "The AI service isn't configured correctly.", retryable: false };
  if (status === 403)
    return { code: "forbidden", message: "The AI service declined this request.", retryable: false };
  if (status === 400)
    return { code: "invalid_input", message: "The AI service couldn't process these details.", retryable: false };
  return { code: "unavailable", message: "The AI planner is temporarily unavailable. Please try again.", retryable: true };
}

export function statusFromError(err: unknown): number | undefined {
  if (err && typeof err === "object") {
    const e = err as { statusCode?: unknown; status?: unknown; cause?: unknown; lastError?: unknown };
    if (typeof e.statusCode === "number") return e.statusCode;
    if (typeof e.status === "number") return e.status;
    if (e.lastError) return statusFromError(e.lastError);
    if (e.cause) return statusFromError(e.cause);
  }
  return undefined;
}
