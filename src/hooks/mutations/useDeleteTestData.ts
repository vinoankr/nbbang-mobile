import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { 
  saveOfflineMutation, 
  type OfflineMutation 
} from '../../utils/offlineQueue';
import { useNetwork } from '../../contexts/NetworkContext';
import { client } from '../../utils/client';

interface UseDeleteTestDataOptions {
  onFormReset: () => void;
}

export const useDeleteTestData = ({ onFormReset }: UseDeleteTestDataOptions) => {
  const queryClient = useQueryClient();
  const { isConnected } = useNetwork();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await client.delete('/slow-delete', { data: { id } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-data'] });
      onFormReset();
      Alert.alert('성공', '데이터가 삭제되었습니다.');
    },
    onError: (error, variables) => {
      if (!isConnected) {
        // 오프라인 상태면 큐에 저장
        const offlineMutation: OfflineMutation = {
          id: `delete-${Date.now()}`,
          url: '/slow-delete',
          method: 'DELETE',
          body: { id: variables },
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