import React, { useState } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { BoldText, MediumText, SemiBoldText } from '@/src/components/Texts';
import { login, me } from '@react-native-kakao/user';
import { client, setAuthToken, setUserData } from '@/src/utils/client';
import Toast from 'react-native-toast-message';

export default function Auth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleKakaoLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      // 카카오 로그인
      await login();
      const userInfo = await me();

      // 백엔드에 카카오 정보 전송
      const response = await client.post(`/auth/kakao`, {
        id: userInfo.id,
        name: userInfo.name,
        phone_number: userInfo.phoneNumber,
      });
      const data = response.data;
      if (data.success) {
        // 로그인 처리
        setAuthToken(data.token);
        setUserData(data.user);
        
        Toast.show({
          type: 'success',
          text1: `환영합니다! ${data.user.name}님!`,
          visibilityTime: 1500,
        });
        
        // TODO: 회원가입 후 리다이렉트 처리
        router.dismissTo('/');
      } else {
        throw new Error(data.error);
      }
    } catch(error){
      console.log('카카오 로그인 실패', error);
      Toast.show({
        type: 'error',
        text1: '로그인 실패',
        visibilityTime: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className='flex-1 bg-blue-500'>
      <View className="flex-1 px-4 justify-center items-center">
        <View className="max-w-md w-full rounded-2xl px-4 py-12 items-center bg-white">
          {/* 로고 이미지 */}
          <Image 
            source={require('../../../assets/images/logo.webp')} 
            className="h-10 w-56 mb-12"
          />
          
          {/* 홍보 멘트 */}
          <View className="mb-10">
            <BoldText className="text-2xl mb-4 text-center" >
              정산, 이제는 잊으세요!
            </BoldText>
            <MediumText className="text-gray-600 text-center text-base">
              결제 내역을 쌓아두기만 하면{'\n'}
              나중에 원클릭 송금으로 정산 가능해요
            </MediumText>
          </View>

          {/* 카카오 로그인 버튼 */}
          <TouchableOpacity 
            onPress={handleKakaoLogin}
            disabled={isLoading}
            className={`w-full h-14 rounded-xl flex-row items-center justify-center gap-2 bg-[#FEE500] ${isLoading ? 'opacity-50' : ''}`}
          >
            <Image 
              source={require('../../../assets/images/kakao.webp')} 
              className="w-5 h-5"
            />
            <SemiBoldText className="text-base text-[#333333]">
              카카오로 시작하기
            </SemiBoldText>
          </TouchableOpacity>

          {/* 전화번호로 시작하기 */}
          <View className="mt-8 flex-col items-center gap-1">
            <MediumText className="text-gray-600 text-center text-sm">
              카카오 계정이 없으신가요?
            </MediumText>
            <TouchableOpacity 
              onPress={() => !isLoading && router.push('/auth/phone')}
              disabled={isLoading}
              className="mt-1"
            >
              <SemiBoldText className="text-gray-800 underline text-sm">
                전화번호로 시작하기
              </SemiBoldText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </View>
    </View>
  );
}
