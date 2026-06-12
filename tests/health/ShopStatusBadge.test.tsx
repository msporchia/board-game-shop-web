import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { ShopStatusBadge } from '../../src/health/ShopStatusBadge.tsx';
import { renderWithProviders } from '../renderWithProviders.tsx';
import { server } from '../server.ts';

describe('ShopStatusBadge', () => {
  it('shows the online badge with the service name when the BFF is healthy', async () => {
    renderWithProviders(<ShopStatusBadge />);

    expect(await screen.findByText(/board-game-shop-api/)).toBeInTheDocument();
    expect(screen.getByText(/Il negozio è online/)).toBeInTheDocument();
  });

  it('shows the offline message when the BFF returns an error', async () => {
    server.use(
      http.get('http://localhost:3000/health', () => new HttpResponse(null, { status: 500 })),
    );

    renderWithProviders(<ShopStatusBadge />);

    expect(await screen.findByText(/Servizio non raggiungibile/)).toBeInTheDocument();
  });
});
