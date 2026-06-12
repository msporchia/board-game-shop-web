import { SHOP_API_URL } from './config.ts';
import { fetchJson } from './http.ts';

// TODO(cross-repo Phase 2): replace with types generated from the BFF's OpenAPI
// spec once its cart slice lands (see docs/phase-2.md for the agreed contract).

/** Cart line as composed by the BFF: denormalized snapshot, server-computed total. */
export interface CartItem {
  productId: number;
  name: string;
  image: string | null;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
}

/** Server-side cart keyed by the localStorage customer id; all totals are the BFF's. */
export interface Cart {
  customerId: string;
  currency: 'EUR';
  items: CartItem[];
  totalItems: number;
  totalCents: number;
}

export async function fetchCart(customerId: string, signal?: AbortSignal): Promise<Cart> {
  return fetchJson<Cart>(`${SHOP_API_URL}/carts/${customerId}`, { signal });
}

/** Sets the quantity of a product in the cart (idempotent add/update). Returns the full cart. */
export async function putCartItem(
  customerId: string,
  productId: number,
  quantity: number,
): Promise<Cart> {
  return fetchJson<Cart>(`${SHOP_API_URL}/carts/${customerId}/items/${productId}`, {
    method: 'PUT',
    body: { quantity },
  });
}

/** Removes a product from the cart. Returns the full cart. */
export async function deleteCartItem(customerId: string, productId: number): Promise<Cart> {
  return fetchJson<Cart>(`${SHOP_API_URL}/carts/${customerId}/items/${productId}`, {
    method: 'DELETE',
  });
}
