import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchProducts } from '../api/products.ts';
import type { ProductsPage } from '../contracts/products.ts';

/** Paginated catalog as server state; the previous page is kept while the next one loads. */
export function useCatalogProducts(page: number): UseQueryResult<ProductsPage> {
  return useQuery({
    queryKey: ['products', page],
    queryFn: ({ signal }) => fetchProducts(page, signal),
    placeholderData: keepPreviousData,
  });
}
