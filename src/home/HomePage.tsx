import { useShopHealth } from '../health/useShopHealth.ts';

export function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-6 text-center">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Board Game Shop</h1>
        <p className="text-lg text-slate-600">
          Il negozio di giochi da tavolo, consigliato da un'AI.
        </p>
      </header>
      <ShopStatusBadge />
    </main>
  );
}

/**
 * Small status pill driven by the shop BFF health query. Private to HomePage —
 * it has no use elsewhere, so it cohabits rather than getting its own module.
 */
function ShopStatusBadge() {
  const { isPending, isError, data } = useShopHealth();

  if (isPending) {
    return (
      <span className="rounded-full bg-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600">
        Negozio in preparazione…
      </span>
    );
  }

  if (isError) {
    return (
      <span className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800">
        Servizio non raggiungibile
      </span>
    );
  }

  return (
    <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-800">
      Il negozio è online · {data.service}
    </span>
  );
}
