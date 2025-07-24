import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/src/utils/client';
import { CurrencyCode } from '@/src/constants/currencies';
import Toast from 'react-native-toast-message';

// 참가자와 금액이 포함된 인터페이스
export interface ParticipantWithAmount {
  id: string;
  amount: number;
  amountInCurrency: number;
}

export interface AddExpenseData {
  groupId: string;
  title: string;
  amount: number;
  amountInCurrency: number;
  currency: CurrencyCode;
  exchangeRate: number;
  paidBy: string;
  spentAt?: Date;
  participants: ParticipantWithAmount[];
  isTransfer: boolean;
  splitType?: string;
  createdAt?: Date;
  transferTo?: string;
}

interface AddExpenseResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    group_id: string;
    title: string;
    amount: number;
    amount_in_currency: number;
    currency: string;
    exchange_rate: number;
    paid_by: string;
    is_transfer: boolean;
    transfer_to: string | null;
    split_type: string | null;
    spent_at: string | null;
    created_at: string;
  };
}

const addExpense = async (data: AddExpenseData): Promise<AddExpenseResponse> => {
  const response = await client.post('/expenses/add', {
    ...data,
    spentAt: data.spentAt?.toISOString() || null,
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : data.createdAt?.toISOString() || null
  });
  return response.data;
};

export const useAddExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addExpense,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupExpenses', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['allExpenseParticipations', variables.groupId] });
      
      Toast.show({
        type: 'success',
        text1: '지출이 추가되었습니다!',
      });
    },
    onError: (error: any) => {
      console.error('지출 추가 실패:', error);
      Toast.show({
        type: 'error',
        text1: error.response?.data?.error || '지출 추가에 실패했습니다.',
      });
    },
  });
}; 