import { useShopHealth } from './useShopHealth.ts';

/** Small status pill driven by the shop BFF health query. */
export function ShopStatusBadge() {
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
