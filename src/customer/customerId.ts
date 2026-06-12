const STORAGE_KEY = 'board-game-shop:customer_id';

/**
 * Demo identity (no auth, by design — see README): a client-generated id
 * persisted in localStorage. The server-side cart and the order history key
 * off it, which is what makes session memory tangible across reloads.
 */
export function getCustomerId(): string {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    return existing;
  }
  const created = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, created);
  return created;
}
