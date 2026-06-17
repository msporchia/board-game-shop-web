import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { AppLayout } from '../../src/app/AppLayout.tsx';
import { CatalogPage } from '../../src/catalog/CatalogPage.tsx';
import { CheckoutPage } from '../../src/checkout/CheckoutPage.tsx';
import { renderWithProviders } from '../renderWithProviders.tsx';

function renderShop() {
  return renderWithProviders(
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Route>
    </Routes>,
  );
}

describe('chat to checkout flow', () => {
  it('adds a recommended game to the cart and reaches checkout', async () => {
    const user = userEvent.setup();
    renderShop();

    await user.click(await screen.findByRole('button', { name: 'Consigliami un gioco' }));
    const chat = await screen.findByRole('dialog', { name: 'Consulente giochi' });
    await user.type(
      within(chat).getByLabelText('Messaggio per il consulente'),
      'Cerco un cooperativo per due',
    );
    await user.click(within(chat).getByRole('button', { name: 'Invia' }));

    expect(await within(chat).findByText(/partirei da Gloomhaven/)).toBeInTheDocument();
    expect(within(chat).getByText('Gloomhaven')).toBeInTheDocument();

    await user.click(within(chat).getByRole('button', { name: 'Aggiungi Gloomhaven al carrello' }));
    await user.click(within(chat).getByRole('link', { name: 'Vai al checkout' }));

    expect(await screen.findByRole('heading', { name: 'Checkout' })).toBeInTheDocument();
    expect(await screen.findByText('Gloomhaven')).toBeInTheDocument();
    expect(screen.getAllByText(/139,90/).length).toBeGreaterThan(0);
  });
});
