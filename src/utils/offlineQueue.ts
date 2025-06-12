import { mmkvStorage } from './storage';

// Store offline mutations
const OFFLINE_MUTATIONS_KEY = 'offline-mutations';

export interface OfflineMutation {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE';
  body: any;
  headers?: Record<string, string>;
  timestamp: number;
  queryKey?: string[]; // For invalidating queries after success
}

export const saveOfflineMutation = (mutation: OfflineMutation) => {
  const mutations = getOfflineMutations();
  mutations.push(mutation);
  mmkvStorage.setItem(OFFLINE_MUTATIONS_KEY, JSON.stringify(mutations));
  console.log('Offline mutation saved:', mutation);
};

export const getOfflineMutations = (): OfflineMutation[] => {
  const mutations = mmkvStorage.getItem(OFFLINE_MUTATIONS_KEY);
  return mutations ? JSON.parse(mutations) : [];
};

export const retryOfflineMutations = async () => {
  const mutations = getOfflineMutations();
  
  if (mutations.length === 0) {
    console.log('No offline mutations to retry');
    return;
  }

  console.log(`Retrying ${mutations.length} offline mutations`);
  
  const results = await Promise.allSettled(
    mutations.map(async (mutation) => {
      try {
        const response = await fetch(mutation.url, {
          method: mutation.method,
          headers: {
            'Content-Type': 'application/json',
            ...mutation.headers,
          },
          body: JSON.stringify(mutation.body),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Offline mutation succeeded:', mutation.id);
        
        // Remove successful mutation
        removeMutation(mutation.id);
        
        return { success: true, mutation, result };
      } catch (error) {
        console.error('Offline mutation failed:', mutation.id, error);
        return { success: false, mutation, error };
      }
    })
  );

  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - successful;
  
  console.log(`Offline mutations completed: ${successful} successful, ${failed} failed`);
  
  return { successful, failed, results };
};

export const removeMutation = (mutationId: string) => {
  const mutations = getOfflineMutations();
  const updated = mutations.filter(m => m.id !== mutationId);
  mmkvStorage.setItem(OFFLINE_MUTATIONS_KEY, JSON.stringify(updated));
};

export const clearOfflineMutations = () => {
  mmkvStorage.removeItem(OFFLINE_MUTATIONS_KEY);
  console.log('Offline mutations cleared');
};