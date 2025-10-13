import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { BoldText, SemiBoldText } from '../Texts';

interface GroupSettingsModalProps {
  handleOpenShareModal: () => void;
  handleNavigateToLedger: () => void;
  handleEditGroup: () => void;
  handleLeaveGroup: () => void;
  handleNavigateToFaq: () => void;
}

export default function GroupSettingsModal({
  handleOpenShareModal,
  handleNavigateToLedger,
  handleEditGroup,
  handleLeaveGroup,
  handleNavigateToFaq,
}: GroupSettingsModalProps) {
  return (
    <View className="w-full flex flex-col gap-2">
      <BoldText className="text-[23px] mb-4">그룹 설정</BoldText>
      
      <TouchableOpacity 
        className="w-full p-3 bg-gray-100 rounded-lg"
        activeOpacity={0.9}
        onPress={handleNavigateToFaq}
      >
        <SemiBoldText className="text-center text-base">FAQ</SemiBoldText>
      </TouchableOpacity>
      <TouchableOpacity 
        className="w-full p-3 bg-gray-100 rounded-lg"
        activeOpacity={0.9}
        onPress={handleOpenShareModal}
      >
        <SemiBoldText className="text-center text-base">멤버 초대하기</SemiBoldText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="w-full p-3 bg-gray-100 rounded-lg"
        activeOpacity={0.9}
        onPress={handleNavigateToLedger}
      >
        <SemiBoldText className="text-center text-base">쓴 돈 모아보기</SemiBoldText>
      </TouchableOpacity>

      <TouchableOpacity 
        className="w-full p-3 bg-gray-100 rounded-lg"
        activeOpacity={0.9}
        onPress={handleEditGroup}
      >
        <SemiBoldText className="text-center text-base">그룹 수정하기</SemiBoldText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="w-full p-3 bg-red-100 rounded-lg"
        activeOpacity={0.9}
        onPress={handleLeaveGroup}
      >
        <SemiBoldText className="text-center text-red-500 text-base">그룹 나가기</SemiBoldText>
      </TouchableOpacity>
    </View>
  );
} 