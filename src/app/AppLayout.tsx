import { useState } from 'react';
import { Link, Outlet } from 'react-router';
import { CartButton } from '../cart/CartButton.tsx';
import { CartDrawer } from '../cart/CartDrawer.tsx';
import { ShopStatusBadge } from '../health/ShopStatusBadge.tsx';

/** App shell: header with brand, BFF status and cart; pages render in the outlet. */
export function AppLayout() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-slate-900">
            Board Game Shop
          </Link>
          <div className="flex items-center gap-3">
            <ShopStatusBadge />
            <CartButton onClick={() => setCartOpen(true)} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
