import { test } from '@playwright/test';
import { mockShopBff } from './support/mockBff.ts';

/**
 * Not a smoke test: this captures the static screenshots embedded in the README
 * (docs/screenshots/*.png), one per stage of the app, against the mocked BFF. Run it
 * with `npm run demo:screenshots`. A short settle pause before each shot lets motion
 * finish so the stills are crisp.
 */
test('capture README screenshots', async ({ page }) => {
  const settle = () => page.waitForTimeout(450);
  const shot = async (name: string) => {
    await settle();
    await page.screenshot({ path: `docs/screenshots/${name}.png` });
  };

  await mockShopBff(page);
  await page.goto('/');

  // 1. Catalog: the minimal storefront baseline.
  await page.getByRole('heading', { name: 'Azul' }).waitFor();
  await shot('01-catalog');

  // 2. Cart: server-side cart with optimistic add and server totals.
  await page.getByRole('button', { name: 'Aggiungi Azul al carrello' }).click();
  await page.getByRole('button', { name: /Apri il carrello/ }).click();
  const cart = page.getByRole('dialog', { name: 'Carrello' });
  await cart.getByText('Totale').waitFor();
  await shot('02-cart');
  await cart.getByRole('button', { name: 'Chiudi' }).click();

  // 3. Identity switcher: passwordless demo "login" / multi-user.
  await page.locator('button[aria-haspopup="menu"]').click();
  await page.getByRole('menu').waitFor();
  await shot('03-identity-switcher');
  await page.getByRole('button', { name: 'Chiudi il menu utente' }).click();

  // 4. Chat — structured choices (the advisor narrows down before proposing).
  await page.getByRole('button', { name: 'Consigliami un gioco' }).click();
  const chat = page.getByRole('dialog', { name: 'Consulente giochi' });
  await chat
    .getByLabel('Messaggio per il consulente')
    .fill('Non so quale gioco scegliere, mi aiuti?');
  await chat.getByRole('button', { name: 'Invia' }).click();
  await chat.getByText(/che tipo di serata avete in mente/).waitFor();
  await shot('04-chat-choices');

  // 5. Chat — two grounded recommendation cards inside the conversation.
  await chat.getByRole('button', { name: 'Per due giocatori' }).click();
  await chat.getByRole('heading', { name: 'Gloomhaven' }).waitFor();
  await shot('05-chat-recommendations');

  // 6. Checkout: server-computed recap before confirming.
  await chat.getByRole('button', { name: 'Aggiungi Gloomhaven al carrello' }).click();
  await chat.getByRole('link', { name: 'Vai al checkout' }).click();
  await page.getByRole('heading', { name: 'Checkout' }).waitFor();
  await shot('06-checkout');

  // 7. Order confirmed: the server cart became an order.
  await page.getByRole('button', { name: 'Conferma ordine' }).click();
  await page.getByRole('heading', { name: 'Ordine confermato' }).waitFor();
  await shot('07-order-confirmed');
});
