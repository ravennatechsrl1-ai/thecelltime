export async function parseAdminResponse<T = Record<string, unknown>>(
  response: Response
): Promise<T> {
  const text = await response.text();
  if (!text) {
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      response.ok
        ? "Invalid server response."
        : `Request failed (${response.status})`
    );
  }
}

export async function adminFetch<T = Record<string, unknown>>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<{ response: Response; data: T }> {
  const response = await fetch(input, init);
  const data = await parseAdminResponse<T>(response);
  return { response, data };
}
