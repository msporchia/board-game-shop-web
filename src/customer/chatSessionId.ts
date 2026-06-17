const STORAGE_KEY = 'board-game-shop:chat_session_id';

/** Demo chat identity: persisted so the seller can carry memory across turns. */
export function getChatSessionId(): string {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    return existing;
  }
  const created = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, created);
  return created;
}
