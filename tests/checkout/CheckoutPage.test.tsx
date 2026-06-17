import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckoutPage } from '../../src/checkout/CheckoutPage.tsx';
import { getCustomerId } from '../../src/customer/customerId.ts';
import { readCart, writeCartItem } from '../cartStore.ts';
import { renderWithProviders } from '../renderWithProviders.tsx';

function seedCart(): string {
  const customerId = getCustomerId();
  writeCartItem(customerId, {
    productId: 101,
    name: 'Azul',
    image: 'https://images.example.test/azul.jpg',
    unitPriceCents: 3490,
    quantity: 2,
    lineTotalCents: 6980,
  });
  return customerId;
}

describe('CheckoutPage', () => {
  it('shows the cart recap with server-computed totals', async () => {
    seedCart();
    renderWithProviders(<CheckoutPage />);

    expect(await screen.findByText('Azul')).toBeInTheDocument();
    expect(screen.getByText(/2 ×/)).toBeInTheDocument();
    expect(screen.getAllByText(/69,80/).length).toBeGreaterThan(0);
  });

  it('confirms the order, shows the recap and the BFF clears the cart', async () => {
    const user = userEvent.setup();
    const customerId = seedCart();
    renderWithProviders(<CheckoutPage />);

    await user.click(await screen.findByRole('button', { name: 'Conferma ordine' }));

    expect(await screen.findByText('Ordine confermato')).toBeInTheDocument();
    expect(screen.getByText(/Ordine n\. 1/)).toBeInTheDocument();
    expect(screen.getByText('Azul')).toBeInTheDocument();
    expect(readCart(customerId).items).toHaveLength(0);
  });

  it('shows the empty state when the cart is empty', async () => {
    renderWithProviders(<CheckoutPage />);

    expect(await screen.findByText(/Il tuo carrello è vuoto/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Torna al catalogo/ })).toHaveAttribute('href', '/');
  });
});
