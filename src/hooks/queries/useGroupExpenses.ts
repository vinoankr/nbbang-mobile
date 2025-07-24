import { useQuery } from "@tanstack/react-query";
import { client } from '@/src/utils/client';

// 백엔드 API에서 그룹 지출 내역을 조회하는 함수
const getGroupExpenses = async (groupId: string) => {
  const response = await client.get(`/expenses/group/${groupId}`);
  return response.data.data;
};

// 그룹 지출 내역 조회 훅
export const useGroupExpenses = (groupId: string | undefined, currentUser: any, isMemberOfGroup: boolean) => {
  return useQuery({
    queryKey: ['groupExpenses', groupId],
    queryFn: () => getGroupExpenses(groupId!),
    enabled: !!groupId && !!currentUser && isMemberOfGroup,
    staleTime: 2 * 60 * 1000, // 2분
  });
}; 