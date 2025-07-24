import { useQuery } from "@tanstack/react-query";
import { client } from '@/src/utils/client';

// 멤버 계좌 정보 타입 정의
export interface MemberAccountInfo {
  account_number: string | null;
  kakaopay_id: string | null;
  bank: string | null;
}

// 백엔드 API에서 그룹 멤버의 계좌 정보를 조회하는 함수
const getMemberAccountInfo = async (memberId: string) => {
  const response = await client.get(`/groups/member-account/${memberId}`);
  return response.data.data as MemberAccountInfo;
};

// 그룹 멤버 계좌 정보 조회 훅
export const useGroupMemberAccountInfo = (memberId: string | undefined) => {
  return useQuery({
    queryKey: ['memberAccountInfo', memberId],
    queryFn: () => getMemberAccountInfo(memberId!),
    enabled: !!memberId,
    staleTime: 1000 * 60 * 60 * 24,
  });
};
