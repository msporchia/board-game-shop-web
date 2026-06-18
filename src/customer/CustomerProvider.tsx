import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { CustomerContext } from './customerContext.ts';
import {
  createCustomer as createCustomerInStore,
  ensureActiveCustomer,
  loadCustomers,
  setActiveCustomerId,
  type Customer,
} from './customers.ts';

/** Provides the active demo identity and the switch/create actions to the app. */
export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer>(ensureActiveCustomer);
  const [customers, setCustomers] = useState<Customer[]>(loadCustomers);

  const switchTo = useCallback((id: string) => {
    const next = loadCustomers().find((entry) => entry.id === id);
    if (next) {
      setActiveCustomerId(id);
      setCustomer(next);
    }
  }, []);

  const createCustomer = useCallback(() => {
    const next = createCustomerInStore();
    setCustomers(loadCustomers());
    setCustomer(next);
  }, []);

  const value = useMemo(
    () => ({ customer, customers, switchTo, createCustomer }),
    [customer, customers, switchTo, createCustomer],
  );

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}
