import { Link } from 'react-router';
import type { Product } from '../contracts/products.ts';
import { AddToCartButton } from '../cart/AddToCartButton.tsx';
import { formatCents } from '../ui/money.ts';

interface GameCardProps {
  product: Product;
}

export function GameCard({ product }: GameCardProps) {
  const facts = [
    product.playersDisplay ? `${product.playersDisplay} giocatori` : null,
    product.durationMin != null ? `${product.durationMin} min` : null,
    product.complexity,
  ].filter((fact): fact is string => fact != null);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
      <Link to={`/games/${product.id}`} className="flex flex-1 flex-col">
        {product.image ? (
          <img
            src={product.image}
            alt=""
            loading="lazy"
            className="aspect-square w-full object-cover"
          />
        ) : (
          <div
            className="flex aspect-square w-full items-center justify-center bg-slate-100 text-5xl"
            aria-hidden
          >
            🎲
          </div>
        )}
        <div className="flex flex-1 flex-col gap-1 p-4">
          <h2 className="font-semibold text-slate-900">{product.name}</h2>
          {facts.length > 0 ? <p className="text-sm text-slate-600">{facts.join(' · ')}</p> : null}
          <p className="mt-auto flex items-baseline justify-between pt-2">
            {product.priceCents != null ? (
              <span className="text-base font-semibold text-slate-900">
                {formatCents(product.priceCents)}
              </span>
            ) : (
              <span className="text-sm text-slate-500">Prezzo non disponibile</span>
            )}
            {product.rating != null ? (
              <span className="text-sm font-medium text-amber-600">
                ★ {product.rating.toFixed(1)}
              </span>
            ) : null}
          </p>
        </div>
      </Link>
      <div className="p-4 pt-0">
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
