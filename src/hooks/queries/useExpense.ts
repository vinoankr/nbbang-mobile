import { useQuery } from "@tanstack/react-query";
import { client } from '@/src/utils/client';
import { AxiosError } from "axios";

// 백엔드 API에서 특정 지출 정보를 조회하는 함수
const getExpenseById = async (expenseId: string) => {
  const response = await client.get(`/expenses/${expenseId}`);
  return response.data.data;
};

// 특정 지출 정보 조회 훅
export const useExpenseById = (expenseId: string | undefined) => {
  return useQuery({
    queryKey: ['expense', expenseId],
    queryFn: () => getExpenseById(expenseId!),
    enabled: !!expenseId,
    staleTime: 5 * 60 * 1000, // 5분
    retry: 0
  });
}; 