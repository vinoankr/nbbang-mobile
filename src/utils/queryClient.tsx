import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { mmkvStorage } from './storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity,
      staleTime: 0,
      refetchOnMount: 'always',
      retry: 0,
      networkMode: 'online',
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