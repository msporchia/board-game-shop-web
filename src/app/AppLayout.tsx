import { useState } from 'react';
import { Link, Outlet } from 'react-router';
import { CartButton } from '../cart/CartButton.tsx';
import { CartDrawer } from '../cart/CartDrawer.tsx';
import { ChatButton } from '../chat/ChatButton.tsx';
import { ChatDrawer } from '../chat/ChatDrawer.tsx';
import { CustomerMenu } from '../customer/CustomerMenu.tsx';
import { ShopStatusBadge } from '../health/ShopStatusBadge.tsx';

/** App shell: header with brand, BFF status and cart; pages render in the outlet. */
export function AppLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-slate-900">
            Board Game Shop
          </Link>
          <div className="flex items-center gap-3">
            <ShopStatusBadge />
            <ChatButton onClick={() => setChatOpen(true)} />
            <CartButton onClick={() => setCartOpen(true)} />
            <CustomerMenu />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
