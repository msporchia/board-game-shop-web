import { fetchJson } from './http.ts';
import type { Cart } from '../contracts/cart.ts';

const ENDPOINTS = {
  cart: (customerId: string) => `/carts/${customerId}`,
  item: (customerId: string, productId: number) => `/carts/${customerId}/items/${productId}`,
} as const;

export async function fetchCart(customerId: string, signal?: AbortSignal): Promise<Cart> {
  return fetchJson<Cart>(ENDPOINTS.cart(customerId), { signal });
}

/** Sets the quantity of a product in the cart (idempotent add/update). Returns the full cart. */
export async function putCartItem(
  customerId: string,
  productId: number,
  quantity: number,
): Promise<Cart> {
  return fetchJson<Cart>(ENDPOINTS.item(customerId, productId), {
    method: 'PUT',
    body: { quantity },
  });
}

/** Removes a product from the cart. Returns the full cart. */
export async function deleteCartItem(customerId: string, productId: number): Promise<Cart> {
  return fetchJson<Cart>(ENDPOINTS.item(customerId, productId), {
    method: 'DELETE',
  });
}
