interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Caricamento…' }: LoadingStateProps) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-16 text-slate-500">
      <span
        className="size-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"
        aria-hidden
      />
      <p className="text-sm">{message}</p>
    </div>
  );
}
