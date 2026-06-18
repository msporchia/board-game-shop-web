import { type ReactNode } from 'react';
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from './createQueryClient.ts';
import { CustomerProvider } from '../customer/CustomerProvider.tsx';

interface AppProvidersProps {
  children: ReactNode;
  client?: QueryClient;
}

export function AppProviders({ children, client }: AppProvidersProps) {
  const queryClient = client ?? createQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <CustomerProvider>{children}</CustomerProvider>
    </QueryClientProvider>
  );
}
