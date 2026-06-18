import { fetchJson } from './http.ts';
import type { Cart } from '../contracts/cart.ts';

// The active customer travels in the X-Customer-Id header (see api/http.ts), so the
// cart routes are no longer keyed by id in the path.
const ENDPOINTS = {
  cart: () => `/cart`,
  item: (productId: number) => `/cart/items/${productId}`,
} as const;

export async function fetchCart(signal?: AbortSignal): Promise<Cart> {
  return fetchJson<Cart>(ENDPOINTS.cart(), { signal });
}

/** Sets the quantity of a product in the cart (idempotent add/update). Returns the full cart. */
export async function putCartItem(productId: number, quantity: number): Promise<Cart> {
  return fetchJson<Cart>(ENDPOINTS.item(productId), {
    method: 'PUT',
    body: { quantity },
  });
}

/** Removes a product from the cart. Returns the full cart. */
export async function deleteCartItem(productId: number): Promise<Cart> {
  return fetchJson<Cart>(ENDPOINTS.item(productId), {
    method: 'DELETE',
  });
}
