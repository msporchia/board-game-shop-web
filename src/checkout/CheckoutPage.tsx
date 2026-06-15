import { Link } from 'react-router';
import { useCreateOrder } from './useCreateOrder.ts';
import type { Order } from '../contracts/orders.ts';
import { useCart } from '../cart/useCart.ts';
import { EmptyState } from '../ui/EmptyState.tsx';
import { ErrorState } from '../ui/ErrorState.tsx';
import { LoadingState } from '../ui/LoadingState.tsx';
import { formatCents } from '../ui/money.ts';

export function CheckoutPage() {
  const { cart, isPending, isError } = useCart();
  const createOrderMutation = useCreateOrder();

  if (createOrderMutation.isSuccess) {
    return <OrderRecap order={createOrderMutation.data} />;
  }

  if (isPending) {
    return <LoadingState message="Carichiamo il carrello…" />;
  }

  if (isError || !cart) {
    return (
      <ErrorState
        title="Il checkout non è disponibile"
        detail="Riprova tra qualche istante."
        action={<BackToCatalogLink />}
      />
    );
  }

  if (cart.items.length === 0) {
    return <EmptyState message="Il tuo carrello è vuoto." action={<BackToCatalogLink />} />;
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Checkout</h1>
      <OrderLines items={cart.items} />
      <p className="flex items-center justify-between text-lg font-semibold text-slate-900">
        <span>Totale</span>
        <span>{formatCents(cart.totalCents)}</span>
      </p>
      {createOrderMutation.isError ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          Non siamo riusciti a confermare l'ordine. Riprova.
        </p>
      ) : null}
      <button
        type="button"
        disabled={createOrderMutation.isPending}
        onClick={() => createOrderMutation.mutate()}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {createOrderMutation.isPending ? "Invio dell'ordine…" : 'Conferma ordine'}
      </button>
    </section>
  );
}

/** Private to CheckoutPage: the post-order recap (number, date, lines, total). */
function OrderRecap({ order }: { order: Order }) {
  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ordine confermato</h1>
        <p className="text-slate-600">
          Ordine n. {order.id} · {new Date(order.createdAt).toLocaleDateString('it-IT')}
        </p>
      </header>
      <OrderLines items={order.items} />
      <p className="flex items-center justify-between text-lg font-semibold text-slate-900">
        <span>Totale</span>
        <span>{formatCents(order.totalCents)}</span>
      </p>
      <p className="text-center">
        <BackToCatalogLink />
      </p>
    </section>
  );
}

/** Private to CheckoutPage: order/cart lines with server-computed money. */
function OrderLines({ items }: { items: Order['items'] }) {
  return (
    <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
      {items.map((item) => (
        <li key={item.productId} className="flex items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="font-medium text-slate-900">{item.name}</p>
            <p className="text-sm text-slate-600">
              {item.quantity} × {formatCents(item.unitPriceCents)}
            </p>
          </div>
          <p className="font-medium text-slate-900">{formatCents(item.lineTotalCents)}</p>
        </li>
      ))}
    </ul>
  );
}

function BackToCatalogLink() {
  return (
    <Link to="/" className="text-sm font-medium text-slate-900 underline">
      Torna al catalogo
    </Link>
  );
}
