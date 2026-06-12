import { Link, useParams } from 'react-router';
import { useProduct } from './useProduct.ts';
import { ApiError } from '../api/http.ts';
import { ErrorState } from '../ui/ErrorState.tsx';
import { LoadingState } from '../ui/LoadingState.tsx';

export function ProductDetailPage() {
  const { id } = useParams();
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId < 1) {
    return <NotFoundState />;
  }

  return <ProductDetailContent productId={productId} />;
}

/** Private to ProductDetailPage: split out so hooks run only with a valid id. */
function ProductDetailContent({ productId }: { productId: number }) {
  const { isPending, isError, error, data } = useProduct(productId);

  if (isPending) {
    return <LoadingState message="Carichiamo la scheda del gioco…" />;
  }

  if (isError) {
    if (error instanceof ApiError && error.status === 404) {
      return <NotFoundState />;
    }
    return (
      <ErrorState
        title="La scheda non è disponibile"
        detail="Riprova tra qualche istante."
        action={<BackToCatalogLink />}
      />
    );
  }

  const facts: Array<[string, string]> = [];
  if (data.players_display) facts.push(['Giocatori', data.players_display]);
  if (data.duration_min != null) facts.push(['Durata', `${data.duration_min} min`]);
  if (data.age_min != null) facts.push(['Età', `${data.age_min}+`]);
  if (data.complexity) facts.push(['Complessità', data.complexity]);
  if (data.year != null) facts.push(['Anno', String(data.year)]);
  if (data.autori) facts.push(['Autori', data.autori]);
  if (data.marca) facts.push(['Editore', data.marca]);
  if (data.categoria) facts.push(['Categoria', data.categoria]);

  return (
    <article className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        {data.image ? (
          <img
            src={data.image}
            alt={data.name}
            className="aspect-square w-full rounded-xl border border-slate-200 object-cover"
          />
        ) : (
          <div
            className="flex aspect-square w-full items-center justify-center rounded-xl bg-slate-100 text-7xl"
            aria-hidden
          >
            🎲
          </div>
        )}
        <div className="space-y-4">
          <header className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{data.name}</h1>
            {data.internal_rating != null ? (
              <p className="text-base font-medium text-amber-600">
                ★ {data.internal_rating.toFixed(1)} / 10
              </p>
            ) : null}
          </header>
          <dl className="flex flex-col gap-1 text-sm">
            {facts.map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <dt className="w-28 shrink-0 font-medium text-slate-900">{label}</dt>
                <dd className="text-slate-600">{value}</dd>
              </div>
            ))}
          </dl>
          {data.tags.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {data.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Descrizione</h2>
        <p className="max-w-prose whitespace-pre-line text-slate-700">{data.description}</p>
      </section>
    </article>
  );
}

function NotFoundState() {
  return (
    <ErrorState
      title="Gioco non trovato"
      detail="Il gioco che cerchi non è in catalogo."
      action={<BackToCatalogLink />}
    />
  );
}

function BackToCatalogLink() {
  return (
    <Link to="/" className="text-sm font-medium text-slate-900 underline">
      Torna al catalogo
    </Link>
  );
}
