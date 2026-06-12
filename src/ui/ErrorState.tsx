import { type ReactNode } from 'react';

interface ErrorStateProps {
  title: string;
  detail?: string;
  /** Optional action (e.g. a link back to the catalog). */
  action?: ReactNode;
}

export function ErrorState({ title, detail, action }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-2 py-16 text-center">
      <p className="text-lg font-semibold text-slate-900">{title}</p>
      {detail ? <p className="text-sm text-slate-600">{detail}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
