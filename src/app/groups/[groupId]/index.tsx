import React, { useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BoldText, MediumText, SemiBoldText } from '@/src/components/Texts';
import { useModal } from '@/src/hooks/useModal';
import { useGroupInfo } from '@/src/hooks/queries/useGroupInfo';
import { useGroupMembers } from '@/src/hooks/queries/useGroupMembers';
import { useLeaveGroup } from '@/src/hooks/mutations/useLeaveGroup';
import { getUserData, getAuthToken } from '@/src/utils/client';
import Header from '@/src/components/Header';
import GroupDetailTabs from '@/src/components/GroupDetailTabs';
import AuthRequiredModal from '@/src/components/modals/AuthRequiredModal';
import GroupJoinModal from '@/src/components/modals/GroupJoinModal';
import ShareModal from '@/src/components/modals/ShareModal';
import GroupSettingsModal from '@/src/components/modals/GroupSettingsModal';
import Person from '../../../../assets/icons/person.svg';
import { Plus } from 'lucide-react-native';
import { logActiveUser } from '@/src/utils/loggers';
import { mmkvStorage } from '@/src/utils/storage';

export default function GroupDetail() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const id = Array.isArray(groupId) ? groupId[0] : groupId;
  const token = getAuthToken();
  const isAuthenticated = !!token;
  const currentUser = getUserData();
  const { activeTab } = useLocalSearchParams() as { activeTab: string | null };
  const { initialEnter } = useLocalSearchParams() as { initialEnter: string | null };
  
  const { data: group, isLoading: groupLoading, isError: groupError } = useGroupInfo(id);
  const { data: members, isLoading: membersLoading, isError: membersError } = useGroupMembers(id);
  
  const { showModal, closeModal } = useModal();
  const [modalShown, setModalShown] = useState(false);
  const { mutate: leaveGroup } = useLeaveGroup();

  const isLoading = groupLoading || membersLoading;
  const isError = groupError || membersError;

  const handleBackClick = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/groups');
    }
  };

  useEffect(() => {
    if (isAuthenticated && !router.canGoBack()) {
      router.replace('/groups');
      setTimeout(() => {
        router.push(`/groups/${id}?activeTab=${activeTab || 'expenses'}` as any);
      }, 0);
    }
  }, []);

  const unlinkedMembers = useMemo(() => {
    return members?.filter((member: any) => member.user_id === null) || [];
  }, [members]);

  const linkedMembers = useMemo(() => {
    return members?.filter((member: any) => member.user_id !== null) || [];
  }, [members]);

  const memberNameMap = useMemo(() => {
    const map = new Map<string, string>();
    members?.forEach((member: any) => {
      map.set(member.id, member.user_name);
    });
    return map;
  }, [members]);

  const { currentUserMemberId, isMemberOfGroup } = useMemo(() => {
    if (!isAuthenticated) return { currentUserMemberId: null, isMemberOfGroup: false };
    const currentUserMemberId = members?.find((member: any) => member.user_id === currentUser?.id)?.id || null;
    const isMemberOfGroup = isAuthenticated && !!currentUserMemberId;
    return { currentUserMemberId, isMemberOfGroup };
  }, [members, currentUser, isAuthenticated]);

  useEffect(() => {
    if (isLoading || !group || !id || modalShown) return;

    if (!isAuthenticated) {
      setModalShown(true);
      showModal(
        <AuthRequiredModal 
          groupId={id}
          groupName={group.name}
          activeTab={activeTab || 'expenses'}
          closeModal={closeModal}
        />,
        false
      );
    } else if (initialEnter) {
      setModalShown(true);
      handleOpenShareModal();
    } else if (!isMemberOfGroup) {
      setModalShown(true);
      showModal(
        <GroupJoinModal 
          groupId={id}
          groupName={group.name}
          linkedMembers={linkedMembers as any}
          unlinkedMembers={unlinkedMembers as any}
          currentUserId={currentUser?.id}
          currentUserName={currentUser?.name}
          closeModal={closeModal}
          hasPassword={group.hasPassword}
        />,
        false
      );
    }
  }, [isAuthenticated, isMemberOfGroup, isLoading, group, unlinkedMembers, id, currentUser, modalShown, initialEnter]);

  useEffect(() => {
    if (!isAuthenticated || !id) {
      return;
    }
    const YYYYMMDD = new Date().toISOString().split('T')[0];
    const lastVisitDate = mmkvStorage.getItem(`lastVisitDate-${id}`); // 2025-08-27
    if (lastVisitDate === YYYYMMDD) {
      return;
    }
    logActiveUser(id, YYYYMMDD, Platform.OS);
    mmkvStorage.setItem(`lastVisitDate-${id}`, YYYYMMDD);
  }, [isAuthenticated, id]);

  if (!id) {
    router.replace('/');
    return null;
  }

  const handleOpenShareModal = () => {
    const url = `https://nbbang.app/groups/${id}`;
    
    showModal(
      <ShareModal 
        url={url}
        members={members as any[]}
        currentUserName={currentUser?.name}
        groupName={group?.name}
        closeModal={closeModal}
        password={group?.password}
      />
    );
  };

  const handleEditGroup = () => {
    closeModal();
    router.push(`/groups/${id}/edit`);
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      '그룹 나가기',
      '정말로 이 그룹에서 나가시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '나가기',
          style: 'destructive',
          onPress: () => {
            closeModal();
            leaveGroup(id);
          },
        },
      ]
    );
  };

  if (!isLoading && isError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="container mx-auto px-4 py-8">
          <MediumText className="text-base">
            그룹 정보를 불러오는데 실패했습니다.
          </MediumText>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/groups')}>
            <MediumText className="text-blue-500 underline text-base">
              목록으로
            </MediumText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={Platform.OS === 'ios' ? ['top'] : ['top', 'bottom']} className="flex-1 bg-white">
      <Header 
        title="" 
        showBackButton 
        onBackClick={handleBackClick} 
        showRightButton={!isLoading && isMemberOfGroup} 
        onRightButtonClick={() => {
          showModal(
            <GroupSettingsModal
              handleOpenShareModal={handleOpenShareModal}
              handleEditGroup={handleEditGroup}
              handleLeaveGroup={handleLeaveGroup}
            />
          );
        }} 
      />    
      
      <ScrollView    
        className="flex-1 px-4 flex-col pt-[72px]"
        contentContainerStyle={{ paddingBottom: 100 }}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        <View className="h-9 flex-row items-center justify-start mb-6">
          <BoldText className="text-[26px] text-black">
            {isLoading ? '...' : group?.name}
          </BoldText>
          <TouchableOpacity 
            className="flex-row items-center gap-1 mt-1 ml-2.5"
            activeOpacity={0.9}
            onPress={() => {
              if (!isLoading) {
                handleOpenShareModal();
              }
            }}
          >
            <Person width={16} height={16} />
            <SemiBoldText className="text-gray-800 text-base">
              {isLoading ? '..' : members?.length}명 
            </SemiBoldText>
          </TouchableOpacity>
        </View>
        
        {/* 탭 메뉴와 내용 */}
        <GroupDetailTabs 
          groupId={id}
          currency={group?.default_currency || 'KRW'}
          currentUser={currentUser}
          currentUserMemberId={currentUserMemberId || ''}
          members={members || []}
          memberNameMap={memberNameMap}
          isMemberOfGroup={isMemberOfGroup}
          openInviteModal={handleOpenShareModal}
          isLoading={isLoading}
        />
      </ScrollView>
      {!isLoading && (
        <TouchableOpacity
          onPress={()=> {
            router.push({
              pathname: '/groups/[groupId]/add-expense',
              params: { groupId: id, currency: group?.default_currency || 'KRW' },
            });
          }}
          activeOpacity={0.9}
          className="absolute left-1/2 w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
          style={{ 
            transform: [{ translateX: -36 }],
            bottom: insets.bottom + 12,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Plus width={48} height={48} color="white" strokeWidth={2.5} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
