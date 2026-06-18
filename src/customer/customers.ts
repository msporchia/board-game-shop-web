/**
 * Demo identity store (no auth, by design — see README). A customer is a local
 * handle: a generated id plus a friendly name so saved identities are recognizable
 * ("Paolo", "Giulia", …). The list of identities and the active one live in
 * localStorage, which lets the demo switch between customers like a basic login and
 * watch the server-side cart/orders repopulate from the BFF for that id.
 *
 * The id is the only thing sent to the BFF (as the `X-Customer-Id` header, see
 * api/http.ts); it stands in for an auth token that a real backend could later issue.
 */
export interface Customer {
  id: string;
  name: string;
}

const CUSTOMERS_KEY = 'board-game-shop:customers';
const ACTIVE_KEY = 'board-game-shop:active_customer_id';

const NAMES = [
  'Paolo',
  'Giulia',
  'Marco',
  'Francesca',
  'Luca',
  'Chiara',
  'Giacomo',
  'Elena',
  'Davide',
  'Sara',
  'Matteo',
  'Alice',
  'Andrea',
  'Martina',
  'Stefano',
  'Valentina',
];

/** Picks a friendly name, preferring one not already in use. */
function pickName(existing: Customer[]): string {
  const used = new Set(existing.map((customer) => customer.name));
  const free = NAMES.filter((name) => !used.has(name));
  const pool = free.length > 0 ? free : NAMES;
  return pool[Math.floor(Math.random() * pool.length)] ?? 'Ospite';
}

export function loadCustomers(): Customer[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CUSTOMERS_KEY) ?? '[]');
    return Array.isArray(parsed) ? (parsed as Customer[]) : [];
  } catch {
    return [];
  }
}

function saveCustomers(customers: Customer[]): void {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

export function getActiveCustomerId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveCustomerId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
}

/** Creates a new identity with a friendly name, persists it and makes it active. */
export function createCustomer(): Customer {
  const customers = loadCustomers();
  const customer: Customer = { id: crypto.randomUUID(), name: pickName(customers) };
  saveCustomers([...customers, customer]);
  setActiveCustomerId(customer.id);
  return customer;
}

/** Returns the active identity, creating (or adopting the first saved) one if needed. */
export function ensureActiveCustomer(): Customer {
  const customers = loadCustomers();
  const active = customers.find((customer) => customer.id === getActiveCustomerId());
  if (active) {
    return active;
  }
  const [first] = customers;
  if (first) {
    setActiveCustomerId(first.id);
    return first;
  }
  return createCustomer();
}
