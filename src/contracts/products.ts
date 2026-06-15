// TODO(cross-repo Phase 1): replace these hand-written contract mirrors with types
// generated from the BFF's OpenAPI spec (openapi-typescript) once the BFF emits it.
// The BFF translates legacy source names at its seed boundary — the wire model is
// camelCase (see seller-shop docs/phase-1.md).

/** Product as served by the BFF (`GET /products` items and `GET /products/{id}`). */
export interface Product {
  id: number;
  name: string;
  description: string;
  tags: string[];
  authors: string | null;
  players: number[];
  playersDisplay: string | null;
  durationMin: number | null;
  ageMin: number | null;
  complexity: string | null;
  complexityLevel: number | null;
  year: number | null;
  rating: number | null;
  isExpansion: boolean;
  category: string | null;
  brand: string | null;
  image: string | null;
  /**
   * Priced by the BFF from Phase 2 on (the upstream catalog has no price), so it
   * may be missing/null against a Phase 1 BFF — a price-less product cannot be
   * bought.
   */
  priceCents?: number | null;
}

/** One page of the catalog (BFF `GET /products` response). */
export interface ProductsPage {
  products: Product[];
  page: number;
  pageSize: number;
  hasNext: boolean;
}
