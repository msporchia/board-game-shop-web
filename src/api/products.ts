import { fetchJson } from './http.ts';
import type { Product, ProductsPage } from '../contracts/products.ts';

const ENDPOINTS = {
  list: (query: string) => `/products?${query}`,
  byId: (id: number) => `/products/${id}`,
} as const;

export const CATALOG_PAGE_SIZE = 24;

export async function fetchProducts(page: number, signal?: AbortSignal): Promise<ProductsPage> {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(CATALOG_PAGE_SIZE),
  });
  return fetchJson<ProductsPage>(ENDPOINTS.list(query.toString()), { signal });
}

export async function fetchProduct(id: number, signal?: AbortSignal): Promise<Product> {
  return fetchJson<Product>(ENDPOINTS.byId(id), { signal });
}
