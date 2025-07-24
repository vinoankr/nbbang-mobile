import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client, getUserData, setUserData } from '@/src/utils/client';
import Toast from 'react-native-toast-message';

interface CreateGroupData {
  groupName: string;
  participants: string[];
  userName: string;
  defaultCurrency: string;
  password: string;
}

interface CreateGroupResponse {
  success: boolean;
  message: string;
  data: {
    newGroup: {
      id: string;
      name: string;
      created_by: string;
      default_currency: string;
      created_at: string;
    };
    newProfile: {
      id: string;
      name: string;
      primary_group_id: string;
      [key: string]: any;
    };
  };
}

const createGroup = async (data: CreateGroupData): Promise<CreateGroupResponse> => {
  const response = await client.post('/groups/create', data);
  return response.data;
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  const user = getUserData();
  return useMutation({
    mutationFn: createGroup,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userGroups', user?.id] });
      queryClient.setQueryData(['profile'], data.data.newProfile);
      setUserData({
        id: data.data.newProfile.id,
        name: data.data.newProfile.name,
        primary_group_id: data.data.newProfile.primary_group_id
      });
      
      Toast.show({
        type: 'success',
        text1: '그룹이 생성되었습니다!',
      });
    },
    onError: (error: any) => {
      console.error('그룹 생성 실패:', error);
      Toast.show({
        type: 'error',
        text1: error.response?.data?.error || '그룹 생성에 실패했습니다.',
      });
    },
  });
}; 