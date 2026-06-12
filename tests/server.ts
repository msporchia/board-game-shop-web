import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const SHOP_API_URL = 'http://localhost:3000';

/** Default happy-path handlers; individual tests override with server.use(...). */
export const handlers = [
  http.get(`${SHOP_API_URL}/health`, () =>
    HttpResponse.json({ status: 'ok', service: 'board-game-shop-api' }),
  ),
];

export const server = setupServer(...handlers);
