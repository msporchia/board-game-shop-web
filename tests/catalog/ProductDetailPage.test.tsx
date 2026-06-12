import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { ProductDetailPage } from '../../src/catalog/ProductDetailPage.tsx';
import { renderWithProviders } from '../renderWithProviders.tsx';

function renderDetail(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/games/:id" element={<ProductDetailPage />} />
    </Routes>,
    { route },
  );
}

describe('ProductDetailPage', () => {
  it('renders the product with its AI-enriched description', async () => {
    renderDetail('/games/101');

    expect(await screen.findByRole('heading', { name: 'Azul' })).toBeInTheDocument();
    expect(screen.getByText(/azulejos portoghesi/)).toBeInTheDocument();
    expect(screen.getByText('Michael Kiesling')).toBeInTheDocument();
  });

  it('shows the not-found state for an unknown id', async () => {
    renderDetail('/games/999');

    expect(await screen.findByText(/Gioco non trovato/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Torna al catalogo/ })).toHaveAttribute('href', '/');
  });

  it('shows the not-found state for a malformed id without calling the BFF', async () => {
    renderDetail('/games/not-a-number');

    expect(await screen.findByText(/Gioco non trovato/)).toBeInTheDocument();
  });
});
