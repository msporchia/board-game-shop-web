import { test, expect, type Page } from '@playwright/test';
import { products } from '../tests/fixtures/products.ts';
import type { Cart, CartItem } from '../src/contracts/cart.ts';

/**
 * The recorded showcase: a customer asks the advisor for help, gets a grounded
 * recommendation card and adds it to the cart without leaving the conversation,
 * then checks out. Everything runs in a real browser; the shop BFF is mocked at
 * the network boundary so the run is deterministic and needs no live services.
 *
 * The proposed games are real catalog entries, so their ids stay buyable end to end.
 */

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

  // Stand in for the product images (the catalog uses placeholder hosts) so the
  // cards render filled instead of broken in the recording.
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

  // Two-turn advisor: the first (free-text) turn offers structured choices and no
  // games yet; once the customer picks a choice, the second turn proposes two
  // buyable cards. Branches on `choices` since a quick-reply click sends it filled.
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

test('chat advisor: choices then two games then add to cart and order', async ({ page }) => {
  // Short pauses let the recorded video breathe; assertions already auto-wait, so
  // these only pace the demo, they are not synchronization.
  const beat = (ms = 900) => page.waitForTimeout(ms);

  await mockShopBff(page);
  await page.goto('/');
  await beat();

  // Open the advisor and ask, open-ended, for help choosing.
  await page.getByRole('button', { name: 'Consigliami un gioco' }).click();
  const chat = page.getByRole('dialog', { name: 'Consulente giochi' });
  await expect(chat).toBeVisible();
  await page.screenshot({ path: 'e2e/artifacts/01-chat-open.png' });
  await beat();

  await chat
    .getByLabel('Messaggio per il consulente')
    .pressSequentially('Non so quale gioco scegliere, mi aiuti?', { delay: 40 });
  await beat(400);
  await chat.getByRole('button', { name: 'Invia' }).click();

  // First turn: the advisor offers structured choices, no game cards yet.
  await expect(chat.getByText(/che tipo di serata avete in mente/)).toBeVisible();
  const choice = chat.getByRole('button', { name: 'Per due giocatori' });
  await expect(choice).toBeVisible();
  await page.screenshot({ path: 'e2e/artifacts/02-choices.png' });
  await beat();

  // Pick a choice; the advisor answers with two buyable proposals.
  await choice.click();
  await expect(chat.getByRole('heading', { name: 'Azul' })).toBeVisible();
  await expect(chat.getByRole('heading', { name: 'Gloomhaven' })).toBeVisible();
  await page.screenshot({ path: 'e2e/artifacts/03-two-games.png' });
  await beat(1300);

  // Choose one of the two and add it to the cart, then go to checkout.
  await chat.getByRole('button', { name: 'Aggiungi Gloomhaven al carrello' }).click();
  await beat();
  await chat.getByRole('link', { name: 'Vai al checkout' }).click();

  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
  await expect(page.getByText('Gloomhaven')).toBeVisible();
  await expect(page.getByText(/139,90/).first()).toBeVisible();
  await page.screenshot({ path: 'e2e/artifacts/04-checkout.png' });
  await beat(1200);

  // Confirm the order: the server cart becomes an order.
  await page.getByRole('button', { name: 'Conferma ordine' }).click();
  await expect(page.getByRole('heading', { name: 'Ordine confermato' })).toBeVisible();
  await page.screenshot({ path: 'e2e/artifacts/05-order-confirmed.png' });
  await beat(1400);
});
