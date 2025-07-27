import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useModal } from '../../hooks/useModal';
import { BoldText, SemiBoldText } from '../Texts';
import { removeAuthToken, removeUserData } from '@/src/utils/client';

export default function SettingsModal() {
  const router = useRouter();
  const { closeModal } = useModal();

  const handleNavigation = (path: string) => {
    closeModal();
    // TODO: 네비게이션 로직 구현
    console.log('Navigate to:', path);
  };

  const handleLogout = () => {
    removeAuthToken();
    removeUserData();
    router.dismissTo('/');
    closeModal();
  };

  return (
    <View className="w-full flex flex-col gap-2">
      <BoldText className="text-[23px] mb-4">설정</BoldText>
      
      <TouchableOpacity 
        className="w-full p-2.5 bg-gray-100 rounded-lg"
        activeOpacity={0.9}
        onPress={() => handleNavigation('/faq')}
      >
        <SemiBoldText className="text-center text-base">FAQ</SemiBoldText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="w-full p-2.5 bg-gray-100 rounded-lg"
        activeOpacity={0.9}
        onPress={() => handleNavigation('/profile')}
      >
        <SemiBoldText className="text-center text-base">내 정보 수정</SemiBoldText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="w-full p-2.5 bg-gray-100 rounded-lg"
        activeOpacity={0.9}
        onPress={() => handleNavigation('/profile/link-kakaopay')}
      >
        <SemiBoldText className="text-center text-base">카카오페이 연동</SemiBoldText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="w-full p-2.5 bg-red-100 rounded-lg"
        activeOpacity={0.9}
        onPress={handleLogout}
      >
        <SemiBoldText className="text-center text-red-500 text-base">로그아웃</SemiBoldText>
      </TouchableOpacity>
    </View>
  );
} 