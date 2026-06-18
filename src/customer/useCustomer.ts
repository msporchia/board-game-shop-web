import { useContext } from 'react';
import { CustomerContext, type CustomerContextValue } from './customerContext.ts';

/** Reads the active demo identity and the switcher actions. Requires CustomerProvider. */
export function useCustomer(): CustomerContextValue {
  const value = useContext(CustomerContext);
  if (!value) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return value;
}
