import { useQuery } from "@tanstack/react-query";
import { client } from '@/src/utils/client';

// 백엔드 API에서 그룹 멤버 정보를 조회하는 함수
const getGroupMembers = async (groupId: string) => {
  const response = await client.get(`/groups/${groupId}/members`);
  return response.data.data;
};

// 그룹 구성원 조회 훅
export const useGroupMembers = (groupId: string | undefined) => {
  return useQuery({
    queryKey: ['groupMembers', groupId],
    queryFn: () => getGroupMembers(groupId!),
    enabled: !!groupId,
    staleTime: 5 * 60 * 1000, // 5분
  });
}; 