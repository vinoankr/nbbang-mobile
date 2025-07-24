import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client, getUserData, setUserData } from '@/src/utils/client';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';

interface LeaveGroupResponse {
  success: boolean;
  message: string;
}

const leaveGroup = async (groupId: string): Promise<LeaveGroupResponse> => {
  const response = await client.delete(`/groups/${groupId}/leave`);
  return response.data;
};

export const useLeaveGroup = () => {
  const queryClient = useQueryClient();
  const user = getUserData();
  const router = useRouter();

  return useMutation({
    mutationFn: leaveGroup,
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ['userGroups', user?.id] });
      
      if (user?.primary_group_id === groupId) {
        setUserData({
          ...user,
          primary_group_id: null
        });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
      
      Toast.show({
        type: 'success',
        text1: '그룹에서 나갔습니다.',
      });
      if (router.canGoBack()) {
        router.dismissTo('/groups');
      } else {
        router.push('/groups');
      }
    },
    onError: (error: any) => {
      console.error('그룹 나가기 실패:', error);
      Toast.show({
        type: 'error',
        text1: error.response?.data?.error || '그룹 나가기에 실패했습니다.',
      });
    },
  });
};
