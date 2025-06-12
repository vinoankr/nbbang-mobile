import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { mmkvStorage } from './storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity, // Prevent garbage collection
      staleTime: 15 * 60 * 1000, // 15 minutes until data becomes stale
      retry: 0, // Disable automatic retries
      networkMode: 'online', // Prioritize cache
    },
    mutations: {
      networkMode: 'online',
      retry: 0,
    },
  },
});

// Create persister for MMKV
export const persister = createSyncStoragePersister({
  storage: mmkvStorage,
  key: 'QUERY_CACHE',
});