import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
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

describe('customer switch', () => {
  it('switches identity and repopulates the server cart per customer', async () => {
    const user = userEvent.setup();
    const { container } = renderShop();
    const openMenu = async () => {
      const toggle = container.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]');
      if (!toggle) {
        throw new Error('customer menu toggle not found');
      }
      await user.click(toggle);
    };

    // First identity: add Azul to its server cart.
    await user.click(await screen.findByRole('button', { name: 'Aggiungi Azul al carrello' }));
    expect(
      await screen.findByRole('button', { name: /Apri il carrello, 1 articolo$/ }),
    ).toBeInTheDocument();

    // Create a fresh identity → its server cart starts empty.
    await openMenu();
    await user.click(screen.getByRole('button', { name: /Nuovo utente/ }));
    expect(
      await screen.findByRole('button', { name: /Apri il carrello, 0 articoli$/ }),
    ).toBeInTheDocument();

    // Switch back to the first identity → the server cart returns for it.
    await openMenu();
    const previous = screen
      .getAllByRole('menuitemradio')
      .find((item) => item.getAttribute('aria-checked') === 'false');
    if (!previous) {
      throw new Error('expected a second saved identity to switch back to');
    }
    await user.click(previous);
    expect(
      await screen.findByRole('button', { name: /Apri il carrello, 1 articolo$/ }),
    ).toBeInTheDocument();
  });
});
