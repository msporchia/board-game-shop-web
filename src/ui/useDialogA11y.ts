import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Modal dialog keyboard/focus behaviour for a slide-over: focuses the element
 * marked `data-autofocus` (or the first focusable) on open, traps Tab inside the
 * panel, closes on Escape and restores focus to the trigger on close. Returns a
 * ref to attach to the dialog panel.
 */
export function useDialogA11y<T extends HTMLElement>({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<T>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const initial =
      panel.querySelector<HTMLElement>('[data-autofocus]') ??
      panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    initial?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') {
        return;
      }
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    panel.addEventListener('keydown', onKeyDown);
    return () => {
      panel.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open]);

  return panelRef;
}
