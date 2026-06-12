/** Error thrown for non-2xx responses; carries the HTTP status so callers can branch (e.g. 404). */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Typed JSON GET: throws ApiError on non-2xx so TanStack Query treats it as an error state. */
export async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new ApiError(response.status, `Request failed with ${response.status}: ${url}`);
  }
  return (await response.json()) as T;
}
