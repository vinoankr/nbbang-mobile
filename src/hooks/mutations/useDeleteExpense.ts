import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/src/utils/client';
import Toast from 'react-native-toast-message';

interface DeleteExpenseResponse {
  success: boolean;
  message: string;
}

const deleteExpense = async (expenseId: string): Promise<DeleteExpenseResponse> => {
  const response = await client.delete(`/expenses/${expenseId}/delete`);
  return response.data;
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['allExpenseParticipations'] });
      
      Toast.show({
        type: 'success',
        text1: '지출이 삭제되었습니다!',
      });
    },
    onError: (error: any) => {
      console.error('지출 삭제 실패:', error);
      Toast.show({
        type: 'error',
        text1: error.response?.data?.error || '지출 삭제에 실패했습니다.',
      });
    },
  });
}; 