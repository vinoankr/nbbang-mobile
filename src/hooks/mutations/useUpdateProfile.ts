import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client, setUserData } from '@/src/utils/client';
import Toast from 'react-native-toast-message';

interface UpdateProfileRequest {
  name?: string;
  bank?: string;
  account_number?: string;
  kakaopay_id?: string;
}

interface UpdateProfileResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    primary_group_id: string | null;
  };
}

const updateProfile = async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
  const response = await client.put('/auth/me', data);
  return response.data;
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // 사용자 정보 캐시 업데이트
      queryClient.setQueryData(['profile'], data.data);
      setUserData({
        id: data.data.id,
        name: data.data.name,
        primary_group_id: data.data.primary_group_id || null
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: '내 정보 수정 실패!',
      });
    },
  });
};
