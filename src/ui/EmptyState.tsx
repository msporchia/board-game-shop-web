interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <span className="text-4xl" aria-hidden>
        🎲
      </span>
      <p className="text-sm text-slate-600">{message}</p>
    </div>
  );
}
