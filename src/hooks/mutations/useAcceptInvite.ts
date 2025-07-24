import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client, getUserData, setUserData } from '@/src/utils/client';
import Toast from 'react-native-toast-message';

interface JoinGroupRequest {
  memberId: string;
  groupId: string;
  password?: string;
}

interface JoinGroupResponse {
  success: boolean;
  message: string;
  data: {
    newMember: {
      id: string;
      group_id: string;
      user_id: string;
      user_name: string;
    };
    newProfile: {
      id: string;
      name: string;
      primary_group_id: string;
    };
  };
}

const joinGroup = async (data: JoinGroupRequest): Promise<JoinGroupResponse> => {
  const response = await client.post('/groups/join', data);
  return response.data;
};

export const useAcceptInvite = () => {
  const queryClient = useQueryClient();
  const user = getUserData();

  return useMutation({
    mutationFn: joinGroup,
    onSuccess: (data) => {
      setUserData({
        id: data.data.newProfile.id,
        name: data.data.newProfile.name,
        primary_group_id: data.data.newProfile.primary_group_id,
      });
      queryClient.setQueryData(['profile'], data.data.newProfile);
      // 그룹 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['userGroups', user?.id] });
      
      queryClient.invalidateQueries({ queryKey: ['groupInfo', data.data.newMember.group_id] });
      queryClient.invalidateQueries({ queryKey: ['groupMembers', data.data.newMember.group_id] });
      
      Toast.show({
        type: 'success',
        text1: '그룹에 성공적으로 입장했습니다!',
      });
    },
    onError: (error: any) => {
      console.error('그룹 참여 실패:', error);
      Toast.show({
        type: 'error',
        text1: error.response?.data?.error || '그룹 참여에 실패했습니다.',
      });
    },
  });
};
