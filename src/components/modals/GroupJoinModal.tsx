import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { BoldText, MediumText, SemiBoldText } from '../Texts';
import { PrimaryButton } from '../form/PrimaryButton';
import { InputField } from '../form/InputField';
import { useAcceptInvite } from '@/src/hooks/mutations/useAcceptInvite';
import Toast from 'react-native-toast-message';

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
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [showPasswordError, setShowPasswordError] = useState(false);
  
  const { mutate: acceptInvite, isPending: isJoining } = useAcceptInvite();

  const matchingUnlinkedMember = unlinkedMembers.find(
    member => member.user_name === currentUserName
  );

  const handleJoin = () => {
    if (hasPassword && password.length !== 4) {
      setShowPasswordError(true);
      Toast.show({
        type: 'error',
        text1: '4자리 비밀번호를 입력해주세요.',
      });
      return;
    }

    const memberId = selectedMemberId || matchingUnlinkedMember?.id;
    
    if (!memberId) {
      Toast.show({
        type: 'error',
        text1: '참여할 멤버를 선택해주세요.',
      });
      return;
    }

    acceptInvite({
      memberId,
      groupId,
      password: hasPassword ? password : undefined,
    }, {
      onSuccess: () => {
        closeModal();
      }
    });
  };

  return (
    <View className="w-full max-h-96">
      <BoldText className="text-[23px] text-center mb-2">
        그룹 입장하기
      </BoldText>
      
      <MediumText className="text-gray-600 text-base text-center mb-4">
        {`'${groupName}' 그룹에 입장합니다.`}
      </MediumText>

      <ScrollView className="max-h-48" showsVerticalScrollIndicator={false}>
        {matchingUnlinkedMember ? (
          <View className="mb-4">
            <MediumText className="text-base mb-2">
              추천 멤버
            </MediumText>
            <TouchableOpacity
              className={`p-3 rounded-lg border ${
                selectedMemberId === matchingUnlinkedMember.id || selectedMemberId === null
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
              onPress={() => setSelectedMemberId(
                selectedMemberId === matchingUnlinkedMember.id ? null : matchingUnlinkedMember.id
              )}
            >
              <SemiBoldText className="text-base">
                {matchingUnlinkedMember.user_name} (추천)
              </SemiBoldText>
            </TouchableOpacity>
          </View>
        ) : null}

        {unlinkedMembers.filter(m => m.id !== matchingUnlinkedMember?.id).length > 0 && (
          <View className="mb-4">
            <MediumText className="text-base mb-2">
              다른 멤버들
            </MediumText>
            {unlinkedMembers
              .filter(m => m.id !== matchingUnlinkedMember?.id)
              .map((member) => (
                <TouchableOpacity
                  key={member.id}
                  className={`p-3 rounded-lg border mb-2 ${
                    selectedMemberId === member.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  onPress={() => setSelectedMemberId(
                    selectedMemberId === member.id ? null : member.id
                  )}
                >
                  <SemiBoldText className="text-base">
                    {member.user_name}
                  </SemiBoldText>
                </TouchableOpacity>
              ))
            }
          </View>
        )}

        {linkedMembers.length > 0 && (
          <View className="mb-4">
            <MediumText className="text-gray-600 text-base mb-2">
              이미 입장한 멤버들
            </MediumText>
            {linkedMembers.map((member) => (
              <View
                key={member.id}
                className="p-3 rounded-lg bg-gray-100 mb-2"
              >
                <SemiBoldText className="text-gray-600 text-base">
                  {member.user_name} ✓
                </SemiBoldText>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {hasPassword && (
        <View className="mb-4">
          <MediumText className="text-base mb-2">
            입장 비밀번호
          </MediumText>
          <InputField
            placeholder="4자리 숫자 입력"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setShowPasswordError(false);
            }}
            keyboardType="numeric"
            maxLength={4}
          />
          {showPasswordError && (
            <MediumText className="text-red-500 text-sm mt-1">
              4자리 비밀번호를 입력해주세요.
            </MediumText>
          )}
        </View>
      )}

      <View className="flex-row gap-3">
        <TouchableOpacity 
          className="flex-1 p-3 rounded-lg border border-gray-300"
          onPress={closeModal}
          disabled={isJoining}
        >
          <MediumText className="text-center text-base">
            취소
          </MediumText>
        </TouchableOpacity>
        
        <View className="flex-row">
          <PrimaryButton
            title={isJoining ? '입장 중...' : '그룹 입장'}
            onPress={handleJoin}
            disabled={isJoining}
            loading={isJoining}
          />
        </View>
      </View>
    </View>
  );
} 