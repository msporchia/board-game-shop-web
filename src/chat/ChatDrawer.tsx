import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { AddToCartButton } from '../cart/AddToCartButton.tsx';
import type { ChatRecommendation } from '../contracts/chat.ts';
import { formatCents } from '../ui/money.ts';
import { useDialogA11y } from '../ui/useDialogA11y.ts';
import { useChatSession } from './useChatSession.ts';

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface AdvisorTurn {
  id: string;
  role: 'advisor';
  text: string;
  games: ChatRecommendation[];
  quickReplies: string[];
}

interface UserTurn {
  id: string;
  role: 'user';
  text: string;
}

interface ErrorTurn {
  id: string;
  role: 'error';
  text: string;
}

type ChatTurn = AdvisorTurn | UserTurn | ErrorTurn;

const initialTurns: ChatTurn[] = [
  {
    id: 'welcome',
    role: 'advisor',
    text: 'Dimmi per chi stai scegliendo il gioco e che atmosfera cerchi.',
    games: [],
    quickReplies: [],
  },
];

export function ChatDrawer({ open, onClose }: ChatDrawerProps) {
  const [turns, setTurns] = useState<ChatTurn[]>(initialTurns);
  const [draft, setDraft] = useState('');
  const chat = useChatSession();
  const panelRef = useDialogA11y<HTMLElement>({ open, onClose });
  const listRef = useRef<HTMLOListElement>(null);

  // Keep the latest turn (and the typing indicator) in view as the conversation grows.
  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [turns, chat.isPending]);

  if (!open) {
    return null;
  }

  const sendMessage = (message: string, choices: string[] = []) => {
    const trimmed = message.trim();
    if (!trimmed || chat.isPending) {
      return;
    }

    setDraft('');
    setTurns((current) => [...current, { id: crypto.randomUUID(), role: 'user', text: trimmed }]);
    chat.mutate(
      { message: trimmed, choices },
      {
        onSuccess: (response) => {
          setTurns((current) => [
            ...current,
            {
              id: crypto.randomUUID(),
              role: 'advisor',
              text: response.message,
              games: response.games,
              quickReplies: response.quickReplies,
            },
          ]);
        },
        onError: () => {
          setTurns((current) => [
            ...current,
            {
              id: crypto.randomUUID(),
              role: 'error',
              text: 'Non riesco a raggiungere il consulente. Riprova tra poco.',
            },
          ]);
        },
      },
    );
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(draft);
  };

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Chiudi il consulente"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-[1px]"
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Consulente giochi"
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl ring-1 ring-slate-900/5 animate-slide-in-right motion-reduce:animate-none"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex size-10 items-center justify-center rounded-full bg-slate-900 text-lg"
            >
              🎲
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Consulente giochi</h2>
              <p className="flex items-center gap-1.5 text-sm text-slate-500">
                <span aria-hidden className="size-2 rounded-full bg-emerald-500" />
                Raccomandazioni dal venditore RAG
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            Chiudi
          </button>
        </header>

        <ol ref={listRef} className="flex-1 space-y-4 overflow-y-auto scroll-smooth px-6 py-4">
          {turns.map((turn) => (
            <li key={turn.id}>
              <ChatBubble turn={turn} disabled={chat.isPending} onQuickReply={sendMessage} />
            </li>
          ))}
          {chat.isPending ? (
            <li>
              <TypingIndicator />
            </li>
          ) : null}
        </ol>

        <footer className="space-y-3 border-t border-slate-200 px-6 py-4">
          <form onSubmit={submit} className="flex gap-2">
            <label className="sr-only" htmlFor="chat-message">
              Messaggio per il consulente
            </label>
            <input
              id="chat-message"
              data-autofocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={chat.isPending}
              placeholder="Es. cooperativo per due, non troppo lungo"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100"
            />
            <button
              type="submit"
              disabled={chat.isPending || draft.trim().length === 0}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Invia
            </button>
          </form>
          <Link
            to="/checkout"
            onClick={onClose}
            className="block text-center text-sm font-medium text-slate-700 underline"
          >
            Vai al checkout
          </Link>
        </footer>
      </aside>
    </div>
  );
}

/** Three bouncing dots shown while the advisor turn is in flight. */
function TypingIndicator() {
  return (
    <div className="flex max-w-[85%] items-center gap-1.5 rounded-lg bg-slate-100 px-4 py-3.5">
      <span className="sr-only">Sto cercando giochi reali in catalogo…</span>
      <span
        aria-hidden
        className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s] motion-reduce:animate-none"
      />
      <span
        aria-hidden
        className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s] motion-reduce:animate-none"
      />
      <span
        aria-hidden
        className="size-1.5 animate-bounce rounded-full bg-slate-400 motion-reduce:animate-none"
      />
    </div>
  );
}

function ChatBubble({
  turn,
  disabled,
  onQuickReply,
}: {
  turn: ChatTurn;
  disabled: boolean;
  onQuickReply: (message: string, choices?: string[]) => void;
}) {
  if (turn.role === 'user') {
    return (
      <div className="ml-auto max-w-[80%] animate-rise rounded-lg bg-slate-900 px-4 py-3 text-sm text-white motion-reduce:animate-none">
        {turn.text}
      </div>
    );
  }

  if (turn.role === 'error') {
    return (
      <div
        role="alert"
        className="max-w-[85%] animate-rise rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 motion-reduce:animate-none"
      >
        {turn.text}
      </div>
    );
  }

  return (
    <div className="max-w-[92%] animate-rise space-y-3 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-800 motion-reduce:animate-none">
      <p>{turn.text}</p>
      {turn.games.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2">
          {turn.games.map((game) => (
            <li key={game.id} className="flex">
              <RecommendationCard game={game} />
            </li>
          ))}
        </ul>
      ) : null}
      {turn.quickReplies.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {turn.quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              disabled={disabled}
              onClick={() => onQuickReply(reply, [reply])}
              className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {reply}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RecommendationCard({ game }: { game: ChatRecommendation }) {
  const facts = [game.playersDisplay, `${game.durationMin} min`, game.complexity];

  return (
    <article className="flex h-full w-full flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md">
      <img src={game.image} alt="" className="aspect-square w-full rounded-md object-cover" />
      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="truncate text-sm font-semibold text-slate-900">{game.name}</h3>
        <p className="text-xs text-slate-600">{facts.join(' · ')}</p>
        <p className="text-sm font-semibold text-slate-900">{formatCents(game.priceCents)}</p>
      </div>
      <AddToCartButton product={game} compact />
    </article>
  );
}
