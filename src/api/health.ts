import { fetchJson } from './http.ts';
import type { HealthStatus } from '../contracts/health.ts';

const ENDPOINTS = {
  health: () => `/health`,
} as const;

/** Fetches the shop BFF health endpoint; an unreachable/erroring BFF becomes an error state. */
export async function fetchHealth(signal?: AbortSignal): Promise<HealthStatus> {
  return fetchJson<HealthStatus>(ENDPOINTS.health(), { signal });
}
