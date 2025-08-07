import React from 'react';
import { View, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useModal } from '../../hooks/useModal';
import { BoldText, SemiBoldText } from '../Texts';
import { removeAuthToken, removeUserData } from '@/src/utils/client';
import { queryClient } from '@/src/utils/queryClient';

export default function SettingsModal() {
  const router = useRouter();
  const { closeModal } = useModal();

  const handleNavigation = (path: string) => {
    closeModal();
    router.push(path as any);
  };

  const handleLogout = () => {
    removeAuthToken();
    removeUserData();
    router.dismissTo('/');
    queryClient.clear();
    queryClient.removeQueries();
    closeModal();
  };

  const handleWithdrawal = async () => {
    closeModal();
    await Linking.openURL('https://nbbang.app/delete-info');
  };

  return (
    <View className="w-full flex flex-col gap-2">
      <BoldText className="text-[23px] mb-4">설정</BoldText>
      
      <TouchableOpacity 
        className="w-full p-2.5 bg-gray-100 rounded-lg"
        activeOpacity={0.9}
        onPress={() => handleNavigation('/profile/faq')}
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
        onPress={() => handleNavigation('/profile/kakaopay')}
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
      <TouchableOpacity 
        className="w-full p-2.5 bg-red-100 rounded-lg"
        activeOpacity={0.9}
        onPress={handleWithdrawal}
      >
        <SemiBoldText className="text-center text-red-500 text-base">회원탈퇴</SemiBoldText>
      </TouchableOpacity>
    </View>
  );
} 