import { useQuery } from '@tanstack/react-query';
import { client, getUserData, setUserData } from '../../utils/client';

export interface User {
  id: string;
  name: string;
  phone_number: string;
  kakao_id: string | null;
  kakaopay_id: string | null;
  bank: string | null;
  account_number: string | null;
  birth_year: number | null;
  gender: string | null;
  primary_group_id: string | null;
  ios_installed: boolean | null;
  android_installed: boolean | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<User> => {
      const response = await client.get('/auth/me');
      const userData = getUserData()
      if (response.data.data._id !== userData.primary_group_id) {
        setUserData({...userData, primary_group_id: response.data.data.primary_group_id})
      }
      return response.data.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 60, // 1시간간 캐시 유지
  });
};
