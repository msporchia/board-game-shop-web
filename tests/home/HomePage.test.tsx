import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen } from '@testing-library/react';
import { HomePage } from '../../src/home/HomePage.tsx';
import { renderWithProviders } from '../renderWithProviders.tsx';
import { server } from '../server.ts';

describe('HomePage', () => {
  it('shows the online badge with the service name when the BFF is healthy', async () => {
    server.use(
      http.get('http://localhost:3000/health', () =>
        HttpResponse.json({ status: 'ok', service: 'board-game-shop-api' }),
      ),
    );

    renderWithProviders(<HomePage />);

    expect(await screen.findByText(/board-game-shop-api/)).toBeInTheDocument();
    expect(screen.getByText(/Il negozio è online/)).toBeInTheDocument();
  });

  it('shows the offline message when the BFF returns an error', async () => {
    server.use(
      http.get('http://localhost:3000/health', () => new HttpResponse(null, { status: 500 })),
    );

    renderWithProviders(<HomePage />);

    expect(await screen.findByText(/Servizio non raggiungibile/)).toBeInTheDocument();
  });
});
