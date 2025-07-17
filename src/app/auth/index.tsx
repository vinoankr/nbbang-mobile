import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { BoldText, MediumText, RegularText, SemiBoldText } from '@/src/components/Texts';

export default function Auth() {
  const router = useRouter();

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
            onPress={() => {
              // 카카오 로그인 기능은 추후 구현
              console.log('카카오 로그인 버튼 클릭');
            }}
            className="w-full h-14 rounded-xl flex-row items-center justify-center gap-2 bg-[#FEE500]"
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
            <RegularText className="text-gray-600 text-center text-sm">
              카카오 계정이 없으신가요?
            </RegularText>
            <TouchableOpacity 
              onPress={() => router.push('/auth/phone')}
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
