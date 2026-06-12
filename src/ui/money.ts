const euroFormatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });

/** Formats integer cents as Italian-locale euros (e.g. 3490 → "34,90 €"). */
export function formatCents(cents: number): string {
  return euroFormatter.format(cents / 100);
}
