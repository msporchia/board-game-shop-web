import { SHOP_API_URL } from './config.ts';
import { fetchJson } from './http.ts';

// TODO(cross-repo Phase 1): replace these hand-written contract mirrors with types
// generated from the BFF's OpenAPI spec (openapi-typescript) once the BFF emits it.
// Field names mirror the upstream catalog record (seller app/models/game_data.py).

/** Catalog card projection of a product (items of the BFF's `GET /products`). */
export interface ProductSummary {
  id_product: number;
  name: string;
  image: string | null;
  players_display: string | null;
  duration_min: number | null;
  complexity: string | null;
  complexity_level: number | null;
  internal_rating: number | null;
  categoria: string | null;
  marca: string | null;
}

/** Full product record with the AI-enriched description (BFF `GET /products/{id}`). */
export interface ProductDetail extends ProductSummary {
  description: string;
  tags: string[];
  players: number[];
  age_min: number | null;
  year: number | null;
  autori: string | null;
  is_expansion: boolean;
}

/** One page of the catalog (BFF `GET /products` response). */
export interface ProductsPage {
  items: ProductSummary[];
  page: number;
  page_size: number;
  total: number;
}

export const CATALOG_PAGE_SIZE = 24;

export async function fetchProducts(page: number, signal?: AbortSignal): Promise<ProductsPage> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(CATALOG_PAGE_SIZE),
  });
  return fetchJson<ProductsPage>(`${SHOP_API_URL}/products?${params}`, signal);
}

export async function fetchProduct(id: number, signal?: AbortSignal): Promise<ProductDetail> {
  return fetchJson<ProductDetail>(`${SHOP_API_URL}/products/${id}`, signal);
}
