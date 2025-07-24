import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { BoldText, MediumText } from '../Texts';
import { PrimaryButton } from '../form/PrimaryButton';

interface AuthRequiredModalProps {
  groupId: string;
  groupName: string;
  closeModal: () => void;
}

export default function AuthRequiredModal({ 
  groupId, 
  groupName, 
  closeModal 
}: AuthRequiredModalProps) {
  const router = useRouter();

  const handleLogin = () => {
    closeModal();
    router.push('/auth');
  };

  return (
    <View className="w-full flex flex-col gap-4">
      <BoldText className="text-[23px] text-center mb-2">
        로그인이 필요해요
      </BoldText>
      
      <MediumText className="text-gray-600 text-base text-center mb-4">
        {`'${groupName}' 그룹에 입장하려면\n로그인이 필요합니다.`}
      </MediumText>
      
      <PrimaryButton
        title="로그인하기"
        onPress={handleLogin}
      />
      
      <TouchableOpacity onPress={closeModal}>
        <MediumText className="text-gray-500 text-center text-base">
          나중에 하기
        </MediumText>
      </TouchableOpacity>
    </View>
  );
} 