import { type ReactNode } from 'react';

interface EmptyStateProps {
  message: string;
  /** Optional action (e.g. a link back to the catalog). */
  action?: ReactNode;
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <span className="text-4xl" aria-hidden>
        🎲
      </span>
      <p className="text-sm text-slate-600">{message}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
