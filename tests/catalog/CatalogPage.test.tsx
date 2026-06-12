import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { CatalogPage } from '../../src/catalog/CatalogPage.tsx';
import { productSummaries } from '../fixtures/products.ts';
import { renderWithProviders } from '../renderWithProviders.tsx';
import { server } from '../server.ts';

const PRODUCTS_URL = 'http://localhost:3000/products';

describe('CatalogPage', () => {
  it('renders a linked card for every product on the page', async () => {
    renderWithProviders(<CatalogPage />);

    expect(await screen.findByText('Azul')).toBeInTheDocument();
    expect(screen.getByText('Gloomhaven')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Azul/ })).toHaveAttribute('href', '/games/101');
  });

  it('shows the empty state when the catalog has no products', async () => {
    server.use(
      http.get(PRODUCTS_URL, () =>
        HttpResponse.json({ items: [], page: 1, page_size: 24, total: 0 }),
      ),
    );

    renderWithProviders(<CatalogPage />);

    expect(await screen.findByText(/Nessun gioco in catalogo/)).toBeInTheDocument();
  });

  it('shows the error state when the BFF fails', async () => {
    server.use(http.get(PRODUCTS_URL, () => new HttpResponse(null, { status: 500 })));

    renderWithProviders(<CatalogPage />);

    expect(await screen.findByText(/Il catalogo non è disponibile/)).toBeInTheDocument();
  });

  it('loads the next page when "Successiva" is clicked', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(PRODUCTS_URL, ({ request }) => {
        const page = new URL(request.url).searchParams.get('page') ?? '1';
        return HttpResponse.json(
          page === '1'
            ? { items: productSummaries.slice(0, 1), page: 1, page_size: 1, total: 2 }
            : { items: productSummaries.slice(1, 2), page: 2, page_size: 1, total: 2 },
        );
      }),
    );

    renderWithProviders(<CatalogPage />);
    await user.click(await screen.findByRole('button', { name: 'Successiva' }));

    expect(await screen.findByText('Gloomhaven')).toBeInTheDocument();
    expect(screen.getByText('Pagina 2 di 2')).toBeInTheDocument();
  });
});
