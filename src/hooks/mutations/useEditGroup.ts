import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/src/utils/client';
import Toast from 'react-native-toast-message';

interface MemberToRename {
  memberId: string;
  newName: string;
}

interface EditGroupRequest {
  groupId: string;
  groupName?: string;
  membersToRename?: MemberToRename[];
  membersToAdd?: string[];
}

interface EditGroupResponse {
  success: boolean;
  message: string;
  data: {
    group: {
      id: string;
      name: string;
      created_by: string;
      default_currency: string;
    } | null;
    renamedMembers: Array<{
      id: string;
      group_id: string;
      user_id: string | null;
      user_name: string;
    }>;
    addedMembers: Array<{
      id: string;
      group_id: string;
      user_id: string | null;
      user_name: string;
    }>;
  };
}

const editGroup = async ({ groupId, ...data }: EditGroupRequest): Promise<EditGroupResponse> => {
  const response = await client.put(`/groups/${groupId}/edit`, data);
  return response.data;
};

export const useEditGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editGroup,
    onSuccess: (data, variables) => {
      const { groupId } = variables;
      const { group, renamedMembers, addedMembers } = data.data;
      
      let messages = ''
      
      if (group) {
        messages = '그룹 정보가 변경되었습니다'
        queryClient.setQueryData(['groupInfo', groupId], group);
        queryClient.invalidateQueries({ queryKey: ['userGroups'] });
      }

      if (renamedMembers.length > 0 || addedMembers.length > 0) {
        messages = '그룹 정보가 변경되었습니다'
        queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] });
      }
      
      if (messages) {
        Toast.show({
          type: 'success',
          text1: messages,
        });
      }
    },
    onError: (error: any) => {
      console.error('그룹 수정 실패:', error);
      Toast.show({
        type: 'error',
        text1: error.response?.data?.error || '그룹 수정에 실패했습니다.',
      });
    },
  });
}; 