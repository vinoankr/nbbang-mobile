import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client, setUserData } from '@/src/utils/client';
import Toast from 'react-native-toast-message';

interface UpdatePrimaryGroupResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    primary_group_id: string | null;
  };
}

const updatePrimaryGroup = async (primaryGroupId: string | null): Promise<UpdatePrimaryGroupResponse> => {
  const response = await client.put('/auth/primary-group', {
    primary_group_id: primaryGroupId
  });
  return response.data;
};

export const useUpdatePrimaryGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePrimaryGroup,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data.data);
      setUserData({
        id: data.data.id,
        name: data.data.name,
        primary_group_id: data.data.primary_group_id || null
      });
    },
    onError: (error: any) => {
      console.error('Primary 그룹 업데이트 실패:', error);
      Toast.show({
        type: 'error',
        text1: error.response?.data?.error || 'Primary 그룹 업데이트에 실패했습니다.',
      });
    },
  });
}; 