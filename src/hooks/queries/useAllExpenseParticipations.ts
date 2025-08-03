import { useQuery } from "@tanstack/react-query";
import { client } from '@/src/utils/client';

// 백엔드 API에서 그룹의 모든 지출 참가자 정보를 조회하는 함수
const getAllExpenseParticipations = async (groupId: string) => {
  const response = await client.get(`/participants/group/${groupId}`);
  return response.data.data;
};

export const useAllExpenseParticipations = (groupId: string | undefined, enabled: boolean) => {
  return useQuery({
    queryKey: ['allExpenseParticipations', groupId],
    queryFn: () => getAllExpenseParticipations(groupId!),
    enabled: !!groupId && enabled,
    staleTime: 3 * 60 * 1000, // 3분
  });
}; 