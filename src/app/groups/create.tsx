import ScreenLayout from '@/src/components/ScreenLayout';
import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Keyboard } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useCreateGroup } from '@/src/hooks/mutations/useCreateGroup';
import { getUserData } from '@/src/utils/client';
import { currencies } from '@/src/constants/currencies';
import { FormLabel } from '@/src/components/form/FormLabel';
import { InputField } from '@/src/components/form/InputField';
import { SelectField } from '@/src/components/form/SelectField';
import { PrimaryButton } from '@/src/components/form/PrimaryButton';
import { MediumText } from '@/src/components/Texts';
import X from '../../../assets/icons/x.svg';
import Header from '@/src/components/Header';
import { KeyboardAwareScrollView } from '@/src/components/Keyboard';

interface CreateGroupForm {
  groupName: string;
  currency: string;
  password: string;
  participants: string[];
}

export default function CreateGroup() {
  const router = useRouter();
  const user = getUserData();
  const [formData, setFormData] = useState<CreateGroupForm>({
    groupName: '',
    currency: 'KRW',
    password: '',
    participants: []
  });

  const { isInternetReachable } = useNetInfo();
  
  const [participants, setParticipants] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [errors, setErrors] = useState<any>({});
  const [treasurerName, setTreasurerName] = useState<string>('');
  
  const createGroupMutation = useCreateGroup();
  
  const passwordInputRef = useRef<any>(null);
  const participantInputRef = useRef<any>(null);

  useEffect(() => {
    if (!treasurerName) return;
    const available = Array.from(
      new Set([user?.name, ...participants].filter(Boolean).map((n) => n.trim()).filter(Boolean))
    );
    if (!available.includes(treasurerName)) {
      setTreasurerName('');
    }
  }, [participants, user?.name, treasurerName]);

  const validateForm = (): boolean => {
    const newErrors: any = {};
    
    if (!formData.groupName.trim()) {
      newErrors.groupName = '그룹 이름을 입력해주세요';
    }
    
    if (!formData.currency) {
      newErrors.currency = '정산 통화를 선택해주세요';
    }
    
    if (formData.password && formData.password.length !== 4) {
      newErrors.password = '4자리 숫자로 입력해주세요';
    }

    if (participants.length < 1) {
      newErrors.participants = '참가자를 최소 1명 이상 추가해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddParticipant = () => {
    const trimmedName = newParticipant.trim();
    if (trimmedName) {
      if (participants.includes(trimmedName)) {
        Toast.show({
          type: 'error',
          text1: '이미 추가된 참가자입니다.',
        });
        return;
      }
      if (trimmedName === user?.name) {
        Toast.show({
          type: 'error',
          text1: '자신은 자동으로 포함되어 있습니다.',
        });
        return;
      }
      setParticipants([...participants, trimmedName]);
      setNewParticipant('');
      setErrors((prev: any) => ({ ...prev, participants: '' }));
    } else {
      Keyboard.dismiss();
    }
  };

  const handleRemoveParticipant = (index: number) => {
    const updatedParticipants = [...participants];
    updatedParticipants.splice(index, 1);
    setParticipants(updatedParticipants);
  };

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;  
    
    if (!validateForm()) return;
    
    if (!isInternetReachable) {
      Toast.show({
        type: 'error',
        text1: '네트워크 연결이 필요해요 🥺',
      });
      return;
    }
        
    try {
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      
      const result = await createGroupMutation.mutateAsync({
        groupName: formData.groupName,
        participants,
        userName: user.name,
        defaultCurrency: formData.currency,
        password: formData.password,
        treasurerName
      });
      
      router.replace(`/groups/${result.data.newGroup.id}?initialEnter=true`);
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handlePasswordChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 4);
    setFormData(prev => ({ ...prev, password: numericText }));
    setErrors((prev: any) => ({ ...prev, password: '' }));
  };

  const currencyItems = Object.entries(currencies).map(([code, { name }]) => ({
    label: `${name} (${code})`,
    title: `${name} (${code})`,
    value: code
  }));

  const treasurerItems = Array.from(
    new Set([user?.name, ...participants].filter(Boolean).map((n) => n.trim()).filter(Boolean))
  ).map((name) => ({
    label: `총무: ${name}`,
    title: `총무: ${name}`,
    value: name
  }));

  return (
    <ScreenLayout variant="form">
      <Header 
        title="새 그룹 만들기" 
        showBackButton={true}
        onBackClick={() => router.dismissTo('/groups')}
      />
        <KeyboardAwareScrollView
          bottomOffset={50}
          style={{ flex: 1 }}
          className="flex-1 pt-4"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          alwaysBounceVertical={false}
        >
          <View className="mb-6">
            <FormLabel label="그룹 이름" />
            <InputField
              placeholder="최대 12글자"
              value={formData.groupName}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, groupName: text }));
                setErrors((prev: any) => ({ ...prev, groupName: '' }));
              }}
              maxLength={12}
              returnKeyType="next"
              onSubmitEditing={() => participantInputRef.current?.focus()}
            />
            {errors.groupName && (
              <MediumText className="text-red-500 text-sm mt-1 ml-1">{errors.groupName}</MediumText>
            )}
          </View>

          <View className="mb-6">
            <FormLabel label="송금할 때 사용할 통화" />
            <SelectField
              value={formData.currency}
              onChangeValue={(value) => {
                setFormData(prev => ({ ...prev, currency: value || 'KRW' }));
              }}
              items={currencyItems}
            />
            <MediumText className="text-red-500 text-sm mt-1 ml-1">정산과 송금의 기준이 되며, 추후 변경이 불가해요</MediumText>
          </View>

          <View className="mb-6">
            <FormLabel label={`참가자 명단 (총 ${participants.length + 1}명)`} />
            
            <View className="flex-row flex-wrap gap-2 mb-2 min-h-12 p-2 border border-gray-100 rounded-lg">
              <View className="flex-row items-center rounded-lg px-3 py-1.5 bg-gray-50">
                <MediumText className="text-gray-800 text-base">{user?.name}</MediumText>
              </View>
              {participants.map((name, index) => (
                <View key={index} className="flex-row items-center rounded-lg px-3 py-1.5 bg-gray-50">
                  <MediumText className="text-gray-800 text-base">{name}</MediumText>
                  <TouchableOpacity className="w-5 h-5 flex items-end justify-center" onPress={() => handleRemoveParticipant(index)} activeOpacity={0.7}>
                    <X width={16} height={16} color="#30333D" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            
            <InputField
              ref={participantInputRef}
              placeholder="이름 입력 후 엔터"
              value={newParticipant}
              onChangeText={setNewParticipant}
              returnKeyType="done"
              submitBehavior="submit"
              onSubmitEditing={handleAddParticipant}
            />
            
            { errors.participants ? (
              <MediumText className="text-red-500 text-sm mt-1 ml-1">{errors.participants}</MediumText>
            ) : (
              participants.length > 0 && (
                <MediumText className="text-gray-500 text-sm mt-1 ml-1">한 번 추가하면 삭제할 수 없으니 신중히 입력해주세요</MediumText>
              )
            )}
          </View>

          {participants.length >= 2 && (
            <View className="-mt-2 mb-6">
              <SelectField
                value={treasurerName}
                onChangeValue={(value) => setTreasurerName(value || '')}
                items={[
                  { label: '총무 없음(기본값)', title: '총무 없음(기본값)', value: '' },
                  ...treasurerItems,
                ]}
              />
              <MediumText className="text-gray-500 text-sm mt-1 ml-1">
                선택 시 총무를 통해서만 송금이 오가도록 정산돼요
              </MediumText>
            </View>
          )}

          <View className="mb-4">
            <FormLabel label="입장 비밀번호 (선택)" />
            <InputField
              ref={passwordInputRef}
              placeholder="4자리 숫자 입력"
              value={formData.password}
              onChangeText={handlePasswordChange}
              keyboardType="numeric"
              maxLength={4}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
            <MediumText className={`text-sm mt-1 ml-1 ${errors.password ? 'text-red-500' : 'text-gray-500'}`}>
              {errors.password || '링크 유출시 안전장치로 사용돼요'}
            </MediumText>
          </View>
          <View className="flex-row py-4">
            <PrimaryButton
              title={isSubmitting ? '처리 중...' : '그룹 만들기'}
              onPress={handleSubmit}
              disabled={isSubmitting}
              loading={isSubmitting}
            />
          </View>
      </KeyboardAwareScrollView>
    </ScreenLayout>
  );
}