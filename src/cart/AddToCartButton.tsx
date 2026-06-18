import { useCart } from './useCart.ts';
import type { Product } from '../contracts/products.ts';

interface AddToCartButtonProps {
  product: Pick<Product, 'id' | 'name' | 'image' | 'priceCents'>;
  /** Compact icon+label variant for tight spaces (e.g. side-by-side chat cards). */
  compact?: boolean;
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-3.5" fill="currentColor" aria-hidden>
      <path d="M9 4a1 1 0 1 1 2 0v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4z" />
    </svg>
  );
}

/** Adds one unit to the server cart (optimistic). Disabled for a price-less product. */
export function AddToCartButton({ product, compact = false }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const priceCents = product.priceCents ?? null;

  if (priceCents === null) {
    return (
      <button
        type="button"
        disabled
        className={
          compact
            ? 'w-full cursor-not-allowed rounded-lg bg-slate-200 px-2 py-1.5 text-xs font-medium text-slate-500'
            : 'w-full cursor-not-allowed rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-500'
        }
      >
        Non disponibile
      </button>
    );
  }

  const add = () =>
    addItem({ id: product.id, name: product.name, image: product.image, priceCents });

  if (compact) {
    return (
      <button
        type="button"
        aria-label={`Aggiungi ${product.name} al carrello`}
        onClick={add}
        className="flex w-full items-center justify-center gap-1 rounded-lg bg-slate-900 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-700"
      >
        <PlusIcon />
        Aggiungi
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={`Aggiungi ${product.name} al carrello`}
      onClick={add}
      className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
    >
      Aggiungi al carrello
    </button>
  );
}
