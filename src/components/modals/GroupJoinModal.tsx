import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { BoldText, MediumText } from '../Texts';
import { ChevronRight } from 'lucide-react-native';
import { useAcceptInvite } from '@/src/hooks/mutations/useAcceptInvite';
import { PrimaryButton } from '../form/PrimaryButton';
import { SecondaryButton } from '../form/SecondaryButton';
import { InputField } from '../form/InputField';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useNetInfo } from '@react-native-community/netinfo';

interface Member {
  id: string;
  user_name: string;
  user_id: string | null;
}

interface GroupJoinModalProps {
  groupId: string;
  groupName: string;
  linkedMembers: Member[];  
  unlinkedMembers: Member[];
  currentUserId?: string;
  currentUserName?: string;
  closeModal: () => void;
  hasPassword: boolean;
}

export default function GroupJoinModal({
  groupId,
  groupName,
  linkedMembers,
  unlinkedMembers,
  currentUserId,
  currentUserName,
  closeModal,
  hasPassword,
}: GroupJoinModalProps) {
  const [password, setPassword] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const isLoadingRef = useRef(false);
  const acceptInviteMutation = useAcceptInvite();
  const { isInternetReachable } = useNetInfo();
  // 기존 멤버와 연결하는 함수
  const handleLinkToExistingMember = async (memberId: string, password?: string) => {
    if (!currentUserId || isLoadingRef.current) return;
    
    if (!isInternetReachable) {
      Toast.show({
        type: 'error',
        text1: '네트워크 연결이 필요해요',
      });
      return;
    }

    try {
      isLoadingRef.current = true;
      await acceptInviteMutation.mutateAsync({ groupId, memberId, password });
      closeModal();
    } catch (error) {
      // 에러는 mutation의 onError에서 처리됨
      console.error('멤버 연결 실패:', error);
    } finally {
      isLoadingRef.current = false;
    }
  };

  return (
    <View
      className="w-full max-w-md mx-auto"
    >
      <BoldText className="text-[22px] mb-4">
        {groupName}에 입장하세요!
      </BoldText>
      <MediumText className="text-gray-800 mb-3 text-lg">
        {
          isPasswordModalOpen ? (
            "비밀번호를 입력해주세요"
          ) : (
            unlinkedMembers.length > 0 ? '당신의 이름을 선택해 입장하세요' : '그룹 슬롯이 가득찼습니다.'
          )
        }
      </MediumText>
        {
          isPasswordModalOpen ? (
            <>
              <InputField
                value={password}
                onChangeText={(text) => {
                  setPassword(text.replace(/[^0-9]/g, ''));
                }}
                placeholder="4자리 숫자를 입력해주세요"
                maxLength={4}
                keyboardType="numeric"
                returnKeyType="done"
              />
              <View className="w-full flex-row gap-2 mt-4">
                <SecondaryButton
                  title="뒤로가기"
                  onPress={() => setIsPasswordModalOpen(false)}
                  disabled={acceptInviteMutation.isPending}
                />
                <PrimaryButton
                  title="입장하기"
                  onPress={() => {
                    if (password.length === 4 && password.match(/^\d{4}$/)) {
                      handleLinkToExistingMember(selectedMember?.id!, password);
                    }
                  }}
                  disabled={password.length !== 4 || !password.match(/^\d{4}$/) || acceptInviteMutation.isPending}
                />
              </View>
            </>
          ): (
            <ScrollView className="max-h-72" bounces={false} alwaysBounceVertical={false} overScrollMode="never" showsVerticalScrollIndicator={false}>
              <View className="flex flex-col gap-2">
              {linkedMembers.map(member => (
                <TouchableOpacity
                  key={member.id}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl flex-row items-center opacity-50"
                  disabled={true}
                >
                  <MediumText className="flex-1 text-lg text-left">
                    {member.user_name}
                  </MediumText>
                  <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
              {unlinkedMembers.map(member => (
                <TouchableOpacity
                  key={member.id}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl flex-row items-center"
                  onPress={() => {
                    if (hasPassword) {
                      setSelectedMember(member);
                      setIsPasswordModalOpen(true);
                    } else {
                      handleLinkToExistingMember(member.id);
                    }
                  }}
                  disabled={acceptInviteMutation.isPending}
                >
                  <MediumText className="flex-1 text-lg text-left">
                    {member.user_name}
                  </MediumText>
                  <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
              </View>
            </ScrollView>
          )
        }
        {
          unlinkedMembers.length === 0 && (
            <View className="w-full flex-row gap-2 mt-4"> 
              <SecondaryButton
                title="뒤로가기"
                onPress={()=>{
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace('/groups');
                  }
                  closeModal();
                }}
              />
            </View>
          )
        }
    </View>
  );
} 