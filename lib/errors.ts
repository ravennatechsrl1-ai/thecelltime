const isDev = process.env.NODE_ENV === "development";

export function logError(scope: string, error: unknown): void {
  if (isDev) {
    console.error(`[${scope}]`, error);
  }
}

export function getErrorMessage(error: unknown, fallback = "Unexpected error"): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  return fallback;
}

export async function safeJson<T>(
  request: Request
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = (await request.json()) as T;
    return { data, error: null };
  } catch (error) {
    logError("safeJson", error);
    return { data: null, error: "Invalid JSON body" };
  }
}
