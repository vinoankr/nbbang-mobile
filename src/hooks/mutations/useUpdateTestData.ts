import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { 
  saveOfflineMutation, 
  type OfflineMutation 
} from '../../utils/offlineQueue';
import { useNetwork } from '../../contexts/NetworkContext';
import { client } from '../../utils/client';

interface UpdateTestDataParams {
  id: number;
  country: string;
  city: string;
}

interface UseUpdateTestDataOptions {
  onFormReset: () => void;
}

export const useUpdateTestData = ({ onFormReset }: UseUpdateTestDataOptions) => {
  const queryClient = useQueryClient();
  const { isConnected } = useNetwork();

  return useMutation({
    mutationFn: async ({ id, country, city }: UpdateTestDataParams) => {
      const { data } = await client.put('/slow-put', { id, country, city });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-data'] });
      onFormReset();
      Alert.alert('성공', '데이터가 업데이트되었습니다.');
    },
    onError: (error, variables) => {
      if (!isConnected) {
        // 오프라인 상태면 큐에 저장
        const offlineMutation: OfflineMutation = {
          id: `update-${Date.now()}`,
          url: '/slow-put',
          method: 'PUT',
          body: { id: variables.id, country: variables.country, city: variables.city },
          timestamp: Date.now(),
          queryKey: ['test-data'],
        };
        saveOfflineMutation(offlineMutation);
        onFormReset();
        Alert.alert('오프라인', '인터넷 연결 시 자동으로 동기화됩니다.');
      } else {
        Alert.alert('오류', error.message);
      }
    },
  });
}; 