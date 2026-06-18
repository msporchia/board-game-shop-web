import { createContext } from 'react';
import type { Customer } from './customers.ts';

export interface CustomerContextValue {
  /** The active identity; whatever the BFF is keyed on right now. */
  customer: Customer;
  /** All saved identities, for the switcher. */
  customers: Customer[];
  /** Switch the active identity to a saved one (cart/orders refetch for it). */
  switchTo: (id: string) => void;
  /** Create a fresh identity (friendly random name) and make it active. */
  createCustomer: () => void;
}

export const CustomerContext = createContext<CustomerContextValue | null>(null);
