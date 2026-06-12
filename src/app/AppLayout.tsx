import { Link, Outlet } from 'react-router';
import { ShopStatusBadge } from '../health/ShopStatusBadge.tsx';

/** App shell: header with the shop brand and BFF status, pages render in the outlet. */
export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-slate-900">
            Board Game Shop
          </Link>
          <ShopStatusBadge />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
