import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { BoldText, MediumText } from '../Texts';
import { PrimaryButton } from '../form/PrimaryButton';

interface AuthRequiredModalProps {
  groupId: string;
  groupName: string;
  closeModal: () => void;
  activeTab: string;
}

export default function AuthRequiredModal({ 
  groupId, 
  groupName, 
  activeTab,
  closeModal 
}: AuthRequiredModalProps) {
  const router = useRouter();

  const handleJoin = () => {
    if (router.canGoBack()) {
      router.dismissAll();
    }
    router.replace(`/auth?redirectGroupId=${groupId}&activeTab=${activeTab}` as any);
    closeModal();
  };

  return (
    <View className="w-full flex flex-col gap-1">
      <BoldText className="text-[22px] mb-4">
        {groupName}에 초대되었습니다.
      </BoldText>
      
      <MediumText className="text-gray-800 mb-4 text-base leading-6">
        간단한 회원가입 후 그룹에 참여하세요!{'\n'}
        착오송금 방지를 위한 절차입니다 🥺
      </MediumText>
      
      <View className="w-full flex-row">
        <PrimaryButton
          title="가입하러 가기"
          onPress={handleJoin}
        />
      </View>
    </View>
  );
} 