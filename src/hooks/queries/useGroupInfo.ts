import { useQuery } from "@tanstack/react-query";
import { client } from '@/src/utils/client';

// 백엔드 API에서 그룹 상세 정보를 조회하는 함수
const getGroupById = async (groupId: string) => {
  const response = await client.get(`/groups/${groupId}`);
  return response.data.data;
};

// 그룹 정보 조회 훅
export const useGroupInfo = (groupId: string | undefined) => {
  return useQuery({
    queryKey: ['groupInfo', groupId],
    queryFn: () => getGroupById(groupId!),
    enabled: !!groupId,
    staleTime: 5 * 60 * 1000, // 5분
  });
}; 