import { Link } from 'react-router';
import { useCart } from './useCart.ts';
import { EmptyState } from '../ui/EmptyState.tsx';
import { ErrorState } from '../ui/ErrorState.tsx';
import { LoadingState } from '../ui/LoadingState.tsx';
import { formatCents } from '../ui/money.ts';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

/** Right slide-over over the server cart: quantity stepper, removal, server totals. */
export function CartDrawer({ open, onClose }: CartDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Chiudi il carrello"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40"
      />
      <aside
        role="dialog"
        aria-label="Carrello"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Carrello</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            Chiudi
          </button>
        </header>
        <CartDrawerContent onClose={onClose} />
      </aside>
    </div>
  );
}

/** Private to CartDrawer: async states + item list + footer with totals. */
function CartDrawerContent({ onClose }: { onClose: () => void }) {
  const { cart, isPending, isError, setItemQuantity, removeItem } = useCart();

  if (isPending) {
    return <LoadingState message="Carichiamo il carrello…" />;
  }

  if (isError || !cart) {
    return (
      <ErrorState title="Il carrello non è disponibile" detail="Riprova tra qualche istante." />
    );
  }

  if (cart.items.length === 0) {
    return <EmptyState message="Il tuo carrello è vuoto." />;
  }

  return (
    <>
      <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        {cart.items.map((item) => (
          <li key={item.productId} className="flex gap-3">
            {item.image ? (
              <img src={item.image} alt="" className="size-16 rounded-lg object-cover" />
            ) : (
              <div
                className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-2xl"
                aria-hidden
              >
                🎲
              </div>
            )}
            <div className="flex flex-1 flex-col gap-1">
              <p className="font-medium text-slate-900">{item.name}</p>
              <p className="text-sm text-slate-600">{formatCents(item.unitPriceCents)}</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label={`Riduci la quantità di ${item.name}`}
                  onClick={() => setItemQuantity(item, item.quantity - 1)}
                  className="size-7 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  −
                </button>
                <span className="text-sm tabular-nums text-slate-900">{item.quantity}</span>
                <button
                  type="button"
                  aria-label={`Aumenta la quantità di ${item.name}`}
                  onClick={() => setItemQuantity(item, item.quantity + 1)}
                  className="size-7 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="ml-auto text-sm font-medium text-slate-500 underline transition-colors hover:text-slate-900"
                >
                  Rimuovi
                </button>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-900">{formatCents(item.lineTotalCents)}</p>
          </li>
        ))}
      </ul>
      <footer className="space-y-3 border-t border-slate-200 px-6 py-4">
        <p className="flex items-center justify-between text-base font-semibold text-slate-900">
          <span>Totale</span>
          <span>{formatCents(cart.totalCents)}</span>
        </p>
        <Link
          to="/checkout"
          onClick={onClose}
          className="block w-full rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          Vai al checkout
        </Link>
      </footer>
    </>
  );
}
