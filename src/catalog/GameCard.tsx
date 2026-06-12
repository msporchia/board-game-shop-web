import { Link } from 'react-router';
import { type ProductSummary } from '../api/products.ts';

interface GameCardProps {
  product: ProductSummary;
}

export function GameCard({ product }: GameCardProps) {
  const facts = [
    product.players_display ? `${product.players_display} giocatori` : null,
    product.duration_min != null ? `${product.duration_min} min` : null,
    product.complexity,
  ].filter((fact): fact is string => fact != null);

  return (
    <article className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
      <Link to={`/games/${product.id_product}`} className="flex h-full flex-col">
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
          {product.internal_rating != null ? (
            <p className="mt-auto pt-2 text-sm font-medium text-amber-600">
              ★ {product.internal_rating.toFixed(1)}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
