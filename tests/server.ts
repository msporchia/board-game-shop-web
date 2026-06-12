import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { productDetails, productSummaries } from './fixtures/products.ts';

const SHOP_API_URL = 'http://localhost:3000';

/** Default happy-path handlers; individual tests override with server.use(...). */
export const handlers = [
  http.get(`${SHOP_API_URL}/health`, () =>
    HttpResponse.json({ status: 'ok', service: 'board-game-shop-api' }),
  ),
  http.get(`${SHOP_API_URL}/products`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('page_size') ?? '24');
    const start = (page - 1) * pageSize;
    return HttpResponse.json({
      items: productSummaries.slice(start, start + pageSize),
      page,
      page_size: pageSize,
      total: productSummaries.length,
    });
  }),
  http.get(`${SHOP_API_URL}/products/:id`, ({ params }) => {
    const product = productDetails.find((entry) => String(entry.id_product) === params.id);
    return product ? HttpResponse.json(product) : new HttpResponse(null, { status: 404 });
  }),
];

export const server = setupServer(...handlers);
