import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { AppLayout } from '../../src/app/AppLayout.tsx';
import { CatalogPage } from '../../src/catalog/CatalogPage.tsx';
import { renderWithProviders } from '../renderWithProviders.tsx';

function renderShop() {
  return renderWithProviders(
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<CatalogPage />} />
      </Route>
    </Routes>,
  );
}

describe('cart flow', () => {
  it('adds a product from a card and shows it in the drawer with server totals', async () => {
    const user = userEvent.setup();
    renderShop();

    await user.click(await screen.findByRole('button', { name: 'Aggiungi Azul al carrello' }));
    await user.click(await screen.findByRole('button', { name: /Apri il carrello, 1 articolo$/ }));

    const drawer = await screen.findByRole('dialog', { name: 'Carrello' });
    expect(within(drawer).getByText('Azul')).toBeInTheDocument();
    expect(within(drawer).getByText('Totale')).toBeInTheDocument();
    expect(within(drawer).getAllByText(/34,90/).length).toBeGreaterThan(0);
  });

  it('updates totals through the quantity stepper and removes lines', async () => {
    const user = userEvent.setup();
    renderShop();

    await user.click(await screen.findByRole('button', { name: 'Aggiungi Azul al carrello' }));
    await user.click(await screen.findByRole('button', { name: /Apri il carrello/ }));
    const drawer = await screen.findByRole('dialog', { name: 'Carrello' });

    await user.click(within(drawer).getByRole('button', { name: 'Aumenta la quantità di Azul' }));
    expect((await within(drawer).findAllByText(/69,80/)).length).toBeGreaterThan(0);

    await user.click(within(drawer).getByRole('button', { name: 'Rimuovi' }));
    expect(await within(drawer).findByText(/Il tuo carrello è vuoto/)).toBeInTheDocument();
  });

  it('keeps the cart when the customer leaves and comes back', async () => {
    const user = userEvent.setup();
    const first = renderShop();

    await user.click(await screen.findByRole('button', { name: 'Aggiungi Azul al carrello' }));
    expect(
      await screen.findByRole('button', { name: /Apri il carrello, 1 articolo$/ }),
    ).toBeInTheDocument();

    // Same localStorage identity + same (mock) server store = same cart on return.
    first.unmount();
    renderShop();

    await user.click(await screen.findByRole('button', { name: /Apri il carrello, 1 articolo$/ }));
    const drawer = await screen.findByRole('dialog', { name: 'Carrello' });
    expect(within(drawer).getByText('Azul')).toBeInTheDocument();
  });
});
