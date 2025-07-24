import { useQuery } from "@tanstack/react-query";
import { client } from '@/src/utils/client';

// 백엔드 API에서 사용자의 그룹을 조회하는 함수
const getUserGroups = async () => {
  const response = await client.get('/groups');
  return response.data.data;
};

// React Query 사용하여 데이터 조회
export const useUserGroups = (userId: string) => {
  return useQuery({
    queryKey: ['userGroups', userId],
    queryFn: getUserGroups,
    enabled: !!userId, // user가 있을 때만 쿼리 실행
    staleTime: 5 * 60 * 1000, // 5분
  });
};