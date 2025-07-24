import React from 'react';
import { View, Share, ScrollView } from 'react-native';
import { BoldText, MediumText } from '../Texts';
import { PrimaryButton } from '../form/PrimaryButton';
import { Check, LinkIcon } from 'lucide-react-native';
import Spinner from '../Spinner';

interface Member {
  id: string;
  user_name: string;
  user_id: string | null;
}

interface ShareModalProps {
  url: string;
  members: Member[];
  currentUserName: string;
  groupName: string;
  closeModal?: () => void;
  password: string | null;
}

export default function ShareModal({
  url,
  members,
  currentUserName,
  groupName,
  password,
}: ShareModalProps) {
  const handleShare = async () => {
    try {
      await Share.share({
        url: url,
        title: `${groupName} 초대`,
        message: `${currentUserName}님이 ${groupName} 그룹에 초대합니다!`,
      });
    } catch (error) {
      console.error('공유 실패:', error);
    }
  };

  return (
    <View className="max-w-md w-full">
      <BoldText className="w-full text-gray-800 text-[23px] mb-4">초대하기</BoldText>
      <MediumText className="text-gray-500 mb-4 text-base leading-5">
        구성원들이 그룹에 들어올 수 있도록{'\n'}초대링크를 공유해주세요!
      </MediumText>
      
      <View className="mb-4">
        <ScrollView 
          className="max-h-[250px]"
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          bounces={false}
        >
          <View className="bg-[#F1F6FF] rounded-xl overflow-hidden px-3.5 py-1">
            {members.map((member, index) => (
              <View 
                key={index} 
                className={`flex-row items-center justify-between py-3 ${
                  index < members.length - 1 ? 'border-b border-[#DEEBFF]' : ''
                }`}
              >
                <BoldText className="text-gray-800 text-lg">{member.user_name}</BoldText>
                {member.user_id !== null ? (
                  <View className="flex-row items-center gap-1">
                    <Check width={22} height={22} color="#2c7fff" strokeWidth={2.5} />
                    <BoldText className="text-blue-500 text-lg">참여중</BoldText>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-1">
                    <Spinner size={22} color="#71737C" strokeWidth={2.5} />
                    <BoldText className="text-gray-500 text-lg">대기중</BoldText>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
        
        {password && (
          <View className="mt-2 w-full p-3.5 bg-gray-50 rounded-xl overflow-hidden flex-row justify-between items-center">
            <BoldText className="text-gray-800 text-lg">비밀번호</BoldText>
            <BoldText className="text-blue-500 text-lg">{password}</BoldText>
          </View>
        )}
        
      </View>
      
      <View className="flex-row gap-3">
        <View className="flex-1">
          <PrimaryButton
            title="초대 링크 공유하기"
            icon={<LinkIcon size={18} color="#fff" strokeWidth={3} />}
            onPress={handleShare}
          />
        </View>
      </View>
      <View className="absolute -bottom-[52px] left-0 right-0">
        <MediumText className="text-center text-gray-300 text-base">
          *링크가 외부에 유출되지 않도록 조심해주세요!
        </MediumText>
      </View>
    </View>
  );
} 