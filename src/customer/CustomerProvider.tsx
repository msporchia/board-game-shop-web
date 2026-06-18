import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const [customer, setCustomer] = useState<Customer>(ensureActiveCustomer);
  const [customers, setCustomers] = useState<Customer[]>(loadCustomers);

  // Changing identity wipes all server-state caches so cart/orders/etc. refetch
  // fresh for the new id (which now travels in the X-Customer-Id header).
  const switchTo = useCallback(
    (id: string) => {
      const next = loadCustomers().find((entry) => entry.id === id);
      if (next) {
        setActiveCustomerId(id);
        setCustomer(next);
        queryClient.clear();
      }
    },
    [queryClient],
  );

  const createCustomer = useCallback(() => {
    const next = createCustomerInStore();
    setCustomers(loadCustomers());
    setCustomer(next);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(
    () => ({ customer, customers, switchTo, createCustomer }),
    [customer, customers, switchTo, createCustomer],
  );

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}
