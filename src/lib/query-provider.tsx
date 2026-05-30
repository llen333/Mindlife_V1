'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Les données restent fraîches pendant 5 minutes
            staleTime: 5 * 60 * 1000,
            // Cache pendant 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry automatique en cas d'erreur
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus pour garder les données à jour
            refetchOnWindowFocus: true,
            // Ne pas refetch si les données sont fraîches
            refetchOnMount: true,
          },
          mutations: {
            // Retry une fois pour les mutations
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
