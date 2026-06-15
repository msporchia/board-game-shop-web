import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchProduct } from '../api/products.ts';
import type { Product } from '../contracts/products.ts';

/** Single product (with the AI-enriched description) as server state. */
export function useProduct(id: number): UseQueryResult<Product> {
  return useQuery({
    queryKey: ['product', id],
    queryFn: ({ signal }) => fetchProduct(id, signal),
  });
}
