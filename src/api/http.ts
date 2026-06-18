import { SHOP_API_URL } from './config.ts';
import { getActiveCustomerId } from '../customer/customers.ts';

/** Error thrown for non-2xx responses; carries the HTTP status so callers can branch (e.g. 404). */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface JsonRequestOptions {
  method?: 'GET' | 'PUT' | 'POST' | 'DELETE';
  /** JSON-serialized into the request body (with content-type) when present. */
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Typed JSON request against the shop BFF. Takes a relative path (e.g. `/carts/42`) and
 * prepends the base URL here — the single place that knows it. Throws ApiError on non-2xx
 * so TanStack Query treats it as an error state.
 */
export async function fetchJson<T>(path: string, options: JsonRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options;
  const url = `${SHOP_API_URL}${path}`;
  // The active demo identity travels as a header — a stand-in for an auth token a
  // real backend could issue. The BFF can adopt it and drop the path/body customerId.
  const customerId = getActiveCustomerId();
  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (customerId) {
    headers['X-Customer-Id'] = customerId;
  }
  const response = await fetch(url, {
    method,
    signal,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new ApiError(response.status, `Request failed with ${response.status}: ${method} ${url}`);
  }
  return (await response.json()) as T;
}
