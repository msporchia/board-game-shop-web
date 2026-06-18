import { test } from '@playwright/test';
import type { ChatRecommendation } from '../src/contracts/chat.ts';

/**
 * README screenshots captured against the REAL BFF (catalog, images, cart, totals and
 * orders all come from `http://localhost:3000`). The ONLY faked surface is the chat
 * advisor turn: its prose is canned, but the games it proposes are real catalog
 * entries fetched live, so their ids stay buyable end to end. Requires the BFF up.
 *
 * Run with `npm run demo:screenshots:real`. The mocked-BFF variant lives in
 * screenshots.e2e.ts for when the backend is unavailable.
 */

const SHOP_API_URL = 'http://localhost:3000';
const SHOT_DIR = 'docs/screenshots';

interface RealProduct {
  id: number;
  name: string;
  image: string;
  priceCents: number | null;
  playersDisplay?: string | null;
  durationMin?: number | null;
  complexity?: string | null;
}

const toCard = (product: RealProduct): ChatRecommendation => ({
  id: product.id,
  name: product.name,
  image: product.image,
  priceCents: product.priceCents ?? 0,
  playersDisplay: product.playersDisplay ?? '2–4',
  durationMin: product.durationMin ?? 60,
  complexity: product.complexity ?? 'Media',
});

test('capture README screenshots against the real BFF', async ({ page }) => {
  const settle = () => page.waitForTimeout(500);
  const shot = async (name: string) => {
    await page.waitForLoadState('networkidle');
    await settle();
    await page.screenshot({ path: `${SHOT_DIR}/${name}.png` });
  };

  // Two real, buyable catalog games to ground the advisor's (canned) recommendation.
  const response = await page.request.get(`${SHOP_API_URL}/products`);
  const { products } = (await response.json()) as { products: RealProduct[] };
  const buyable = products.filter((product) => product.priceCents != null);
  const [first, second] = buyable;
  if (!first || !second) {
    throw new Error('Need at least two priced products from the real BFF to build the chat cards');
  }

  // Intercept ONLY the advisor turn — everything else hits the real backend.
  await page.route(/\/chat$/, async (route) => {
    const { choices = [] } = route.request().postDataJSON() as { choices?: string[] };
    await new Promise((resolve) => setTimeout(resolve, 550)); // let the typing dots show

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
        message: 'Dal catalogo vi propongo due titoli che si adattano bene a quello che cercate:',
        games: [toCard(first), toCard(second)],
        quickReplies: ["Un'altra idea"],
      },
    });
  });

  await page.goto('/');

  // 1. Catalog — the real storefront with real cover art and prices.
  await page
    .getByRole('button', { name: /^Aggiungi .+ al carrello$/ })
    .first()
    .waitFor();
  await shot('01-catalog');

  // 2. Cart — server cart with a real game, optimistic add, server-computed total.
  await page
    .getByRole('button', { name: /^Aggiungi .+ al carrello$/ })
    .first()
    .click();
  await page.getByRole('button', { name: /Apri il carrello/ }).click();
  const cart = page.getByRole('dialog', { name: 'Carrello' });
  await cart.getByText('Totale').waitFor();
  await shot('02-cart');
  await cart.getByRole('button', { name: 'Chiudi' }).click();

  // 3. Identity switcher — passwordless demo "login" / multi-user.
  await page.locator('button[aria-haspopup="menu"]').click();
  await page.getByRole('menu').waitFor();
  await shot('03-identity-switcher');
  await page.getByRole('button', { name: 'Chiudi il menu utente' }).click();

  // 4. Chat — structured choices (advisor prose is canned, the rest is real).
  await page.getByRole('button', { name: 'Consigliami un gioco' }).click();
  const chat = page.getByRole('dialog', { name: 'Consulente giochi' });
  await chat
    .getByLabel('Messaggio per il consulente')
    .fill('Non so quale gioco scegliere, mi aiuti?');
  await chat.getByRole('button', { name: 'Invia' }).click();
  await chat.getByText(/che tipo di serata avete in mente/).waitFor();
  await shot('04-chat-choices');

  // 5. Chat — two grounded recommendation cards from the real catalog.
  await chat.getByRole('button', { name: 'Per due giocatori' }).click();
  await chat
    .getByRole('button', { name: /^Aggiungi .+ al carrello$/ })
    .first()
    .waitFor();
  await shot('05-chat-recommendations');

  // 6. Checkout — server-computed recap before confirming. Add the *second*
  // recommendation (the catalog step already added the first) so the recap shows
  // two distinct lines instead of a quantity of two.
  await chat
    .getByRole('button', { name: /^Aggiungi .+ al carrello$/ })
    .nth(1)
    .click();
  await chat.getByRole('link', { name: 'Vai al checkout' }).click();
  await page.getByRole('heading', { name: 'Checkout' }).waitFor();
  await shot('06-checkout');

  // 7. Order confirmed — the server cart became a real order.
  await page.getByRole('button', { name: 'Conferma ordine' }).click();
  await page.getByRole('heading', { name: 'Ordine confermato' }).waitFor();
  await shot('07-order-confirmed');
});
