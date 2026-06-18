const STORAGE_KEY = 'board-game-shop:chat_sessions';

function loadSessions(): Record<string, string> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

/**
 * Demo chat identity, scoped per customer: each identity keeps its own seller
 * session so conversational memory belongs to whoever is "logged in". Switching
 * users therefore lands on that user's own session (the UI conversation is reset
 * separately, see ChatDrawer's remount key).
 */
export function getChatSessionId(customerId: string): string {
  const sessions = loadSessions();
  const existing = sessions[customerId];
  if (existing) {
    return existing;
  }
  const created = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...sessions, [customerId]: created }));
  return created;
}
