import type { Page } from '@playwright/test';
import { products } from '../../tests/fixtures/products.ts';
import type { Cart, CartItem } from '../../src/contracts/cart.ts';

/**
 * Stands in for the BFF in e2e runs: a stateful in-memory cart (same shape as the
 * real `/carts/{customerId}` contract) plus canned catalog, image, two-turn chat and
 * order responses. Shared by the chat-to-cart smoke and the screenshot capture so
 * both exercise the same deterministic backend.
 *
 * The two-turn advisor offers structured choices first (no games), then proposes two
 * buyable cards once the customer picks a choice. The proposed games are real catalog
 * entries, so their ids stay buyable end to end.
 */
export async function mockShopBff(page: Page) {
  let items: CartItem[] = [];
  const cartFor = (customerId: string): Cart => ({
    customerId,
    items,
    totalCents: items.reduce((sum, item) => sum + item.lineTotalCents, 0),
  });

  // Stand in for the product images (the catalog uses placeholder hosts) so the
  // cards render filled instead of broken in the recording/screenshots.
  await page.route(/images\.example\.test\//, (route) => {
    const slug = new URL(route.request().url()).pathname.split('/').pop() ?? '';
    const label = slug.replace(/\.\w+$/, '').replace(/^./, (c) => c.toUpperCase());
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#1e293b"/><text x="50%" y="50%" fill="#e2e8f0" font-size="18" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`;
    return route.fulfill({ contentType: 'image/svg+xml', body: svg });
  });

  await page.route(/\/health$/, (route) =>
    route.fulfill({ json: { status: 'ok', service: 'board-game-shop-api' } }),
  );

  await page.route(/\/products(\?|$)/, (route) =>
    route.fulfill({
      json: { products, page: 1, pageSize: products.length, hasNext: false },
    }),
  );

  const card = (product: (typeof products)[number]) => ({
    id: product.id,
    name: product.name,
    image: product.image,
    priceCents: product.priceCents,
    playersDisplay: product.playersDisplay,
    durationMin: product.durationMin,
    complexity: product.complexity,
  });
  const azul = products.find((entry) => entry.name === 'Azul') ?? products[0];
  const gloomhaven = products.find((entry) => entry.name === 'Gloomhaven') ?? products[0];

  await page.route(/\/chat$/, async (route) => {
    const { choices = [] } = route.request().postDataJSON() as { choices?: string[] };
    // A short pause so the typing indicator is visible in the recording.
    await new Promise((resolve) => setTimeout(resolve, 650));

    if (choices.length === 0) {
      return route.fulfill({
        json: {
          message: 'Volentieri! Per orientarmi: che tipo di serata avete in mente?',
          games: [],
          quickReplies: ['Per due giocatori', 'Una sfida tra esperti', 'Qualcosa di rilassato'],
        },
      });
    }

    return route.fulfill({
      json: {
        message:
          'Per due giocatori vi propongo due strade: Azul, elegante e veloce, oppure Gloomhaven, ' +
          "un'avventura cooperativa più corposa.",
        games: [card(azul), card(gloomhaven)],
        quickReplies: ["Un'altra idea"],
      },
    });
  });

  await page.route(/\/cart\/items\/\d+$/, async (route) => {
    const request = route.request();
    const productId = Number(new URL(request.url()).pathname.split('/').pop());
    const product = products.find((entry) => entry.id === productId);
    if (request.method() === 'PUT' && product && product.priceCents != null) {
      const { quantity } = request.postDataJSON() as { quantity: number };
      items = [
        ...items.filter((entry) => entry.productId !== productId),
        {
          productId,
          name: product.name,
          image: product.image,
          unitPriceCents: product.priceCents,
          quantity,
          lineTotalCents: product.priceCents * quantity,
        },
      ];
    } else if (request.method() === 'DELETE') {
      items = items.filter((entry) => entry.productId !== productId);
    }
    await route.fulfill({ json: cartFor('demo-customer') });
  });

  await page.route(/\/cart$/, (route) => route.fulfill({ json: cartFor('demo-customer') }));

  await page.route(/\/orders$/, (route) => {
    const order = {
      id: 1001,
      customerId: 'demo-customer',
      createdAt: '2026-06-17T10:00:00.000Z',
      items,
      totalCents: items.reduce((sum, item) => sum + item.lineTotalCents, 0),
    };
    items = [];
    return route.fulfill({ status: 201, json: order });
  });
}
