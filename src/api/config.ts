/**
 * Base URL of the shop BFF (board-game-shop-api), resolved from the build-time
 * env var. This is a BROWSER-side URL, so it must be reachable from the user's
 * browser — never a docker-internal hostname.
 */
export const SHOP_API_URL: string = import.meta.env.VITE_SHOP_API_URL ?? 'http://localhost:3000';
