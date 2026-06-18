import { useState } from 'react';
import { useCustomer } from './useCustomer.ts';

/**
 * Demo identity switcher in the header. Lets you "log in" by picking a saved
 * identity (the server cart/orders then repopulate for it) or create a new one
 * with a friendly random name. No passwords — it just swaps the active id.
 */
export function CustomerMenu() {
  const { customer, customers, switchTo, createCustomer } = useCustomer();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
      >
        <span aria-hidden>👤</span>
        {customer.name}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Chiudi il menu utente"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg ring-1 ring-slate-900/5"
          >
            <p className="px-3 py-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Cambia utente
            </p>
            <ul>
              {customers.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={entry.id === customer.id}
                    onClick={() => {
                      switchTo(entry.id);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden>👤</span>
                      {entry.name}
                    </span>
                    {entry.id === customer.id ? (
                      <span className="text-xs font-medium text-emerald-600">attivo</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                createCustomer();
                setOpen(false);
              }}
              className="block w-full border-t border-slate-100 px-3 py-2 text-left text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
            >
              + Nuovo utente
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
