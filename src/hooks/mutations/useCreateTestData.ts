import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { 
  saveOfflineMutation, 
  type OfflineMutation 
} from '../../utils/offlineQueue';
import { useNetwork } from '../../contexts/NetworkContext';
import { client } from '../../utils/client';

interface CreateTestDataParams {
  country: string;
  city: string;
}

interface UseCreateTestDataOptions {
  onFormReset: () => void;
}

export const useCreateTestData = ({ onFormReset }: UseCreateTestDataOptions) => {
  const queryClient = useQueryClient();
  const { isConnected } = useNetwork();

  return useMutation({
    mutationFn: async ({ country, city }: CreateTestDataParams) => {
      const { data } = await client.post('/slow-post', { country, city });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-data'] });
      onFormReset();
      Alert.alert('성공', '데이터가 생성되었습니다.');
    },
    onError: (error, variables) => {
      if (!isConnected) {
        // 오프라인 상태면 큐에 저장
        const offlineMutation: OfflineMutation = {
          id: `create-${Date.now()}`,
          url: '/slow-post',
          method: 'POST',
          body: { country: variables.country, city: variables.city },
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