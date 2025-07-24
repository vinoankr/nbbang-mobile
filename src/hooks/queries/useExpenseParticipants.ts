import { useQuery } from "@tanstack/react-query";
import { client } from '@/src/utils/client';

// 백엔드 API에서 지출 참가자 정보를 조회하는 함수
const getExpenseParticipants = async (expenseId: string) => {
  const response = await client.get(`/participants/expense/${expenseId}`);
  return response.data.data;
};

export const useExpenseParticipants = (expenseId: string | undefined, enabled: boolean) => {
  return useQuery({
    queryKey: ['expenseParticipants', expenseId],
    queryFn: () => getExpenseParticipants(expenseId!),
    enabled: !!expenseId && enabled,
    staleTime: 5 * 60 * 1000, // 5분
  });
}; 