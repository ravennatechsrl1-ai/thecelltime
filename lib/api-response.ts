import { NextResponse } from "next/server";
import { getErrorMessage, logError } from "@/lib/errors";

export function apiOk<T extends Record<string, unknown>>(payload: T, status = 200) {
  return NextResponse.json(payload, { status });
}

export function apiError(
  scope: string,
  error: unknown,
  status = 500,
  publicMessage = "Service temporarily unavailable"
) {
  logError(scope, error);
  return NextResponse.json({ error: publicMessage }, { status });
}

export function apiFromResult<T>(
  scope: string,
  fn: () => Promise<T>,
  fallback: T,
  statusOnFail = 200
) {
  return fn()
    .then((data) => NextResponse.json(data, { status: statusOnFail }))
    .catch((error) => {
      logError(scope, getErrorMessage(error));
      return NextResponse.json(fallback, { status: statusOnFail });
    });
}
