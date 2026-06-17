interface ChatButtonProps {
  onClick: () => void;
}

export function ChatButton({ onClick }: ChatButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
    >
      Consigliami un gioco
    </button>
  );
}
