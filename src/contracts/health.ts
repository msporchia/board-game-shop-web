// TODO(cross-repo Phase 0): replace with types generated from the BFF's OpenAPI
// spec (openapi-typescript) once the BFF emits it.

/** Shape of the BFF's `GET /health` response. */
export interface HealthStatus {
  status: string;
  service: string;
}
