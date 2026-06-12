import { useCart } from './useCart.ts';

interface CartButtonProps {
  onClick: () => void;
}

/** Header cart button with a live item-count badge. */
export function CartButton({ onClick }: CartButtonProps) {
  const { itemCount } = useCart();
  const countLabel = itemCount === 1 ? '1 articolo' : `${itemCount} articoli`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Apri il carrello, ${countLabel}`}
      className="relative rounded-lg border border-slate-300 bg-white px-3 py-2 text-base transition-colors hover:bg-slate-100"
    >
      <span aria-hidden>🛒</span>
      {itemCount > 0 ? (
        <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
          {itemCount}
        </span>
      ) : null}
    </button>
  );
}
