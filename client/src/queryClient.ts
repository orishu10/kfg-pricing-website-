import { QueryClient } from '@tanstack/react-query';

// Data stays "fresh" for 30s — navigating back to a page within that window
// renders instantly from cache with no network request at all.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
