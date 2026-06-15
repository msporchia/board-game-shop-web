import { useCart } from './useCart.ts';
import type { Product } from '../contracts/products.ts';

interface AddToCartButtonProps {
  product: Pick<Product, 'id' | 'name' | 'image' | 'priceCents'>;
}

/** Adds one unit to the server cart (optimistic). Disabled for a price-less product. */
export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const priceCents = product.priceCents ?? null;

  if (priceCents === null) {
    return (
      <button
        type="button"
        disabled
        className="w-full cursor-not-allowed rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-500"
      >
        Non disponibile
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={`Aggiungi ${product.name} al carrello`}
      onClick={() =>
        addItem({ id: product.id, name: product.name, image: product.image, priceCents })
      }
      className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
    >
      Aggiungi al carrello
    </button>
  );
}
