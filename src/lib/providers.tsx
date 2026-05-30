'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { MediaPlayerProvider } from '@/contexts/MediaPlayerContext';
import GlobalPlayer from '@/components/growth/components/GlobalPlayer';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <MediaPlayerProvider>
        {children}
        <GlobalPlayer />
      </MediaPlayerProvider>
    </QueryClientProvider>
  );
}
