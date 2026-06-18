import { test, expect } from '@playwright/test';
import { mockShopBff } from './support/mockBff.ts';

/**
 * The recorded showcase: a customer asks the advisor for help, the advisor offers
 * choices, then proposes two grounded game cards; one is added to the cart without
 * leaving the conversation, then checked out. Everything runs in a real browser; the
 * shop BFF is mocked (see support/mockBff.ts) so the run is deterministic and needs
 * no live services.
 */
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
