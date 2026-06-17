import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { clearCart, nextOrderId, readCart, removeCartItem, writeCartItem } from './cartStore.ts';
import { products } from './fixtures/products.ts';

const SHOP_API_URL = 'http://localhost:3000';

const notFound = (message: string) =>
  HttpResponse.json({ error: 'Not Found', message }, { status: 404 });

/** Default happy-path handlers; individual tests override with server.use(...). */
export const handlers = [
  http.get(`${SHOP_API_URL}/health`, () =>
    HttpResponse.json({ status: 'ok', service: 'board-game-shop-api' }),
  ),

  http.get(`${SHOP_API_URL}/products`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '24');
    const start = (page - 1) * pageSize;
    return HttpResponse.json({
      products: products.slice(start, start + pageSize),
      page,
      pageSize,
      hasNext: start + pageSize < products.length,
    });
  }),

  http.get(`${SHOP_API_URL}/products/:id`, ({ params }) => {
    const product = products.find((entry) => String(entry.id) === params.id);
    return product ? HttpResponse.json(product) : notFound('Product not found');
  }),

  http.get(`${SHOP_API_URL}/carts/:customerId`, ({ params }) =>
    HttpResponse.json(readCart(String(params.customerId))),
  ),

  http.put(`${SHOP_API_URL}/carts/:customerId/items/:productId`, async ({ params, request }) => {
    const { quantity } = (await request.json()) as { quantity: number };
    const product = products.find((entry) => String(entry.id) === params.productId);
    if (!product) {
      return notFound('Product not found');
    }
    if (
      product.priceCents == null ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 99
    ) {
      return HttpResponse.json(
        { error: 'Unprocessable Entity', message: 'Invalid cart item' },
        { status: 422 },
      );
    }
    writeCartItem(String(params.customerId), {
      productId: product.id,
      name: product.name,
      image: product.image,
      unitPriceCents: product.priceCents,
      quantity,
      lineTotalCents: product.priceCents * quantity,
    });
    return HttpResponse.json(readCart(String(params.customerId)));
  }),

  http.delete(`${SHOP_API_URL}/carts/:customerId/items/:productId`, ({ params }) => {
    removeCartItem(String(params.customerId), Number(params.productId));
    return HttpResponse.json(readCart(String(params.customerId)));
  }),

  http.post(`${SHOP_API_URL}/orders`, async ({ request }) => {
    const { customerId } = (await request.json()) as { customerId: string };
    const cart = readCart(customerId);
    if (cart.items.length === 0) {
      return HttpResponse.json(
        { error: 'Unprocessable Entity', message: 'Cart is empty' },
        { status: 422 },
      );
    }
    clearCart(customerId);
    return HttpResponse.json(
      {
        id: nextOrderId(),
        customerId,
        createdAt: '2026-06-12T10:00:00.000Z',
        items: cart.items,
        totalCents: cart.totalCents,
      },
      { status: 201 },
    );
  }),

  http.post(`${SHOP_API_URL}/chat`, async ({ request }) => {
    const { choices } = (await request.json()) as { choices?: string[] };
    const narrowed = choices?.includes('max 45 minuti');
    const product = narrowed ? products[0] : products[1];
    if (!product) {
      return HttpResponse.json({
        message: 'Non ho trovato giochi adatti.',
        games: [],
        quickReplies: [],
      });
    }
    return HttpResponse.json({
      message: narrowed
        ? 'Allora Azul è il candidato più rapido: astratto, elegante e sotto l’ora.'
        : 'Se cercate qualcosa di cooperativo e corposo, partirei da Gloomhaven.',
      games: [
        {
          id: product.id,
          name: product.name,
          image: product.image,
          priceCents: product.priceCents,
          playersDisplay: product.playersDisplay,
          durationMin: product.durationMin,
          complexity: product.complexity,
        },
      ],
      quickReplies: narrowed ? ['un’altra idea'] : ['max 45 minuti', 'più leggero'],
    });
  }),
];

export const server = setupServer(...handlers);
