import { test, expect, type Page } from '@playwright/test';
import { products } from '../tests/fixtures/products.ts';
import type { Cart, CartItem } from '../src/contracts/cart.ts';

/**
 * The recorded showcase: a customer asks the advisor for help, gets a grounded
 * recommendation card and adds it to the cart without leaving the conversation,
 * then checks out. Everything runs in a real browser; the shop BFF is mocked at
 * the network boundary so the run is deterministic and needs no live services.
 *
 * The recommended game is a real catalog entry, so its id stays buyable end to end.
 */
const recommended = products.find((entry) => entry.name === 'Gloomhaven') ?? products[0];

/**
 * Stands in for the BFF: a stateful in-memory cart (same shape as the real
 * `/carts/{customerId}` contract) plus canned catalog, chat and order responses.
 */
async function mockShopBff(page: Page) {
  let items: CartItem[] = [];
  const cartFor = (customerId: string): Cart => ({
    customerId,
    items,
    totalCents: items.reduce((sum, item) => sum + item.lineTotalCents, 0),
  });

  await page.route(/\/health$/, (route) =>
    route.fulfill({ json: { status: 'ok', service: 'board-game-shop-api' } }),
  );

  await page.route(/\/products(\?|$)/, (route) =>
    route.fulfill({
      json: { products, page: 1, pageSize: products.length, hasNext: false },
    }),
  );

  await page.route(/\/chat$/, (route) =>
    route.fulfill({
      json: {
        message:
          'Se cercate qualcosa di cooperativo e corposo per le vostre serate, partirei da Gloomhaven.',
        games: [
          {
            id: recommended.id,
            name: recommended.name,
            image: recommended.image,
            priceCents: recommended.priceCents,
            playersDisplay: recommended.playersDisplay,
            durationMin: recommended.durationMin,
            complexity: recommended.complexity,
          },
        ],
        quickReplies: ['Qualcosa di più corto', 'Per principianti', "Un'altra idea"],
      },
    }),
  );

  await page.route(/\/carts\/[^/]+\/items\/\d+$/, async (route) => {
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

  await page.route(/\/carts\/[^/]+$/, (route) => route.fulfill({ json: cartFor('demo-customer') }));

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

test('chat recommendation to cart to order', async ({ page }) => {
  await mockShopBff(page);
  await page.goto('/');

  // Open the advisor and ask for a recommendation.
  await page.getByRole('button', { name: 'Consigliami un gioco' }).click();
  const chat = page.getByRole('dialog', { name: 'Consulente giochi' });
  await expect(chat).toBeVisible();
  await page.screenshot({ path: 'e2e/artifacts/01-chat-open.png' });

  await chat.getByLabel('Messaggio per il consulente').fill('Cerco un cooperativo per due');
  await chat.getByRole('button', { name: 'Invia' }).click();

  // The grounded recommendation card lands inside the conversation.
  await expect(chat.getByText(/partirei da Gloomhaven/)).toBeVisible();
  await expect(chat.getByRole('heading', { name: 'Gloomhaven' })).toBeVisible();
  await page.screenshot({ path: 'e2e/artifacts/02-recommendation.png' });

  // Add to cart straight from the recommendation, then go to checkout.
  await chat.getByRole('button', { name: 'Aggiungi Gloomhaven al carrello' }).click();
  await chat.getByRole('link', { name: 'Vai al checkout' }).click();

  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
  await expect(page.getByText('Gloomhaven')).toBeVisible();
  await expect(page.getByText(/139,90/).first()).toBeVisible();
  await page.screenshot({ path: 'e2e/artifacts/03-checkout.png' });

  // Confirm the order: server cart becomes an order.
  await page.getByRole('button', { name: 'Conferma ordine' }).click();
  await expect(page.getByRole('heading', { name: 'Ordine confermato' })).toBeVisible();
  await page.screenshot({ path: 'e2e/artifacts/04-order-confirmed.png' });
});
