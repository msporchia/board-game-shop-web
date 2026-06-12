import { useSearchParams } from 'react-router';
import { GameCard } from './GameCard.tsx';
import { useCatalogProducts } from './useCatalogProducts.ts';
import { EmptyState } from '../ui/EmptyState.tsx';
import { ErrorState } from '../ui/ErrorState.tsx';
import { LoadingState } from '../ui/LoadingState.tsx';

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = Number(searchParams.get('page'));
  const page = Number.isInteger(pageParam) && pageParam >= 1 ? pageParam : 1;
  const { isPending, isError, data } = useCatalogProducts(page);

  if (isPending) {
    return <LoadingState message="Carichiamo il catalogo…" />;
  }

  if (isError) {
    return (
      <ErrorState title="Il catalogo non è disponibile" detail="Riprova tra qualche istante." />
    );
  }

  if (data.items.length === 0) {
    return <EmptyState message="Nessun gioco in catalogo." />;
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.page_size));

  return (
    <section className="space-y-8">
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.items.map((product) => (
          <li key={product.id_product}>
            <GameCard product={product} />
          </li>
        ))}
      </ul>
      <CatalogPagination
        page={page}
        totalPages={totalPages}
        onPageChange={(next) => setSearchParams(next === 1 ? {} : { page: String(next) })}
      />
    </section>
  );
}

interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Private to CatalogPage: prev/next controls over the `?page=` search param. */
function CatalogPagination({ page, totalPages, onPageChange }: CatalogPaginationProps) {
  const buttonClass =
    'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <nav aria-label="Paginazione del catalogo" className="flex items-center justify-center gap-4">
      <button
        type="button"
        className={buttonClass}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Precedente
      </button>
      <span className="text-sm text-slate-600">
        Pagina {page} di {totalPages}
      </span>
      <button
        type="button"
        className={buttonClass}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Successiva
      </button>
    </nav>
  );
}
