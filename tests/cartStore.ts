import type { Cart, CartItem } from '../src/contracts/cart.ts';

/**
 * Stateful in-memory store behind the MSW cart/order handlers, mimicking the
 * BFF's persistence so flows survive refetch-after-invalidate. Reset between
 * tests in tests/setup.ts.
 */
const carts = new Map<string, CartItem[]>();
let orderSequence = 0;

export function readCart(customerId: string): Cart {
  const items = carts.get(customerId) ?? [];
  return {
    customerId,
    currency: 'EUR',
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalCents: items.reduce((sum, item) => sum + item.lineTotalCents, 0),
  };
}

export function writeCartItem(customerId: string, item: CartItem): void {
  const others = (carts.get(customerId) ?? []).filter(
    (entry) => entry.productId !== item.productId,
  );
  carts.set(customerId, [...others, item]);
}

export function removeCartItem(customerId: string, productId: number): void {
  carts.set(
    customerId,
    (carts.get(customerId) ?? []).filter((entry) => entry.productId !== productId),
  );
}

export function clearCart(customerId: string): void {
  carts.delete(customerId);
}

export function nextOrderId(): number {
  orderSequence += 1;
  return orderSequence;
}

export function resetCarts(): void {
  carts.clear();
  orderSequence = 0;
}
