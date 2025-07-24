import { useRouter } from 'expo-router'
import React, { useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TouchableOpacity, View, ScrollView, Image } from 'react-native';
import { MediumText, SemiBoldText, RegularText } from '@/src/components/Texts';
import { useModal } from '@/src/hooks/useModal';
import GroupCard from '@/src/components/GroupCard';
import SettingsModal from '@/src/components/modals/SettingsModal';

import { PlusIcon, SettingsIcon } from 'lucide-react-native';
import YellowStar from '../../../assets/icons/yellow-star.svg';
import { useUserGroups } from '@/src/hooks/queries/useUserGroups';
import { useUpdatePrimaryGroup } from '@/src/hooks/mutations/useUpdatePrimaryGroup';
import { useProfile } from '@/src/hooks/queries/useMe';
import { getUserData } from '@/src/utils/client';
import Toast from 'react-native-toast-message';

export default function Groups() {
  const router = useRouter();
  const { showModal } = useModal();
  
  // 실제 hooks 사용
  const { mutate: updatePrimaryGroup, isPending: isUpdatingPrimaryGroup } = useUpdatePrimaryGroup();
  useProfile();
  const user = getUserData();
  const { data: groups, isLoading: loadingGroups, error } = useUserGroups(user?.id || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const isNavigating = useRef(false);

  const sortedGroups = groups?.slice().sort((a: any, b: any) => {
    if (a.id === user?.primary_group_id) return -1;
    if (b.id === user?.primary_group_id) return 1;
    return 0;
  });

  const handleSetPrimaryGroup = async (groupId: string) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      
      if (user?.primary_group_id === groupId) {
        updatePrimaryGroup(null);
        Toast.show({
          type: 'success',
          text1: '시작 그룹이 해제되었어요!',
        });
      } else {
        updatePrimaryGroup(groupId);
        Toast.show({
          type: 'success',
          text1: '시작 그룹이 설정되었어요!',
        });
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: '시작 그룹 설정 중 오류가 발생했어요.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateGroup = () => {
    router.push('/groups/create' as any);
  };

  const navigateToGroup = (groupId: string) => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    
    router.push(`/groups/${groupId}` as any)
    setTimeout(() => {
      isNavigating.current = false;
    }, 300);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView    
        className="flex-1 px-4" 
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-end justify-between pt-16 pb-8">
          <TouchableOpacity onPress={() => router.dismissTo('/')}>
            <Image 
              source={require('../../../assets/images/logo.webp')} 
              className="w-52 h-10" 
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => showModal(<SettingsModal />)}
            className="bg-gray-50 rounded-xl p-2 text-gray-800"
            activeOpacity={0.7}
          >
            <SettingsIcon size={24} color="#30333D" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        {loadingGroups ? (
          <RegularText className="text-gray-600 text-base">그룹 목록을 불러오는 중...</RegularText>
        ) : error ? (
          <RegularText className="text-red-500 text-base">그룹 목록을 불러오는 중 오류가 발생했습니다: {(error as Error).message}</RegularText>
        ) : sortedGroups && sortedGroups.length > 0 ? (
          <View>
            {sortedGroups.map((group: any) => (
              <GroupCard 
                key={group.id}
                group={group}
                user={user}
                isUpdating={isUpdating || isUpdatingPrimaryGroup}
                onSetPrimaryGroup={handleSetPrimaryGroup}
                navigateToGroup={navigateToGroup}
              />
            ))}
            
            {user?.primary_group_id && (
              <View className="w-full my-4 flex-row items-center justify-center">
                <MediumText className="text-gray-500 text-base">
                  앱 실행 시 선택된
                </MediumText>
                <YellowStar width={16} height={16} style={{ marginHorizontal: 1 }} />
                <MediumText className="text-gray-500 text-base">
                  시작그룹으로 이동해요!
                </MediumText>
              </View>
            )}
            
            <View className="h-16" />
          </View>
        ) : (
          <View className="mt-4 flex-col items-center gap-1.5">
            <MediumText className="text-gray-800 text-base">
              아직 참여 중인 그룹이 없습니다.
            </MediumText>
            <TouchableOpacity onPress={handleCreateGroup}>
              <MediumText className="text-blue-500 text-base">
                첫 그룹을 만들어보세요!
              </MediumText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      {/* 하단 고정 버튼 */}
      <View className="absolute bottom-8 left-0 right-0 p-4 bg-white">
        <TouchableOpacity
          onPress={handleCreateGroup}
          className="w-full py-5 bg-blue-500 rounded-xl flex-row items-center justify-center"
        >
          <SemiBoldText className="text-white text-lg mr-2">
            새 그룹 만들기
          </SemiBoldText>
          <PlusIcon size={16} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}