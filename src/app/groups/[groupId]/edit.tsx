import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Keyboard, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useGroupInfo } from '@/src/hooks/queries/useGroupInfo';
import { useGroupMembers } from '@/src/hooks/queries/useGroupMembers';
import { useEditGroup } from '@/src/hooks/mutations/useEditGroup';
import { currencies } from '@/src/constants/currencies';
import { FormLabel } from '@/src/components/form/FormLabel';
import { InputField } from '@/src/components/form/InputField';
import { SelectField } from '@/src/components/form/SelectField';
import { PrimaryButton } from '@/src/components/form/PrimaryButton';
import { MediumText } from '@/src/components/Texts';
import Header from '@/src/components/Header';
import { X } from 'lucide-react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

interface EditGroupForm {
  groupName: string;
  currency: string;
  password: string;
}

interface MemberState {
  id: string;
  originalName: string;
  currentName: string;
  isModified: boolean;
}

interface AddedMember {
  id: string; // 임시 ID
  name: string;
}

export default function EditGroup() {
  const { groupId } = useLocalSearchParams();
  const router = useRouter();
  const { data: group, isLoading: groupLoading } = useGroupInfo(groupId as string);
  const { data: members, isLoading: membersLoading } = useGroupMembers(groupId as string);
  const editGroupMutation = useEditGroup();
  const insets = useSafeAreaInsets();
  const { isInternetReachable } = useNetInfo();
  const [formData, setFormData] = useState<EditGroupForm>({
    groupName: '',
    currency: 'KRW',
    password: ''
  });
  
  const [originalMembers, setOriginalMembers] = useState<MemberState[]>([]);
  const [addedMembers, setAddedMembers] = useState<AddedMember[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLoadingRef = useRef(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalGroupName, setOriginalGroupName] = useState('');
  const [originalPassword, setOriginalPassword] = useState('');
  const [originalTreasurerMemberId, setOriginalTreasurerMemberId] = useState<string | null>(null);
  const [treasurerMemberId, setTreasurerMemberId] = useState<string>('');
  const [errors, setErrors] = useState<any>({});

  // 그룹과 멤버 정보가 로드되면 초기값 설정
  useEffect(() => {
    if (group) {
      setFormData({
        groupName: group.name,
        currency: group.default_currency,
        password: group.password || ''
      });
      setOriginalGroupName(group.name);
      setOriginalPassword(group.password || '');
      const treasurerId = group.treasurer != null ? String(group.treasurer) : '';
      setOriginalTreasurerMemberId(treasurerId || null);
      setTreasurerMemberId(treasurerId);
    }
  }, [group]);

  useEffect(() => {
    if (members) {
      const memberStates: MemberState[] = members.map((member: any) => ({
        id: String(member.id),
        originalName: member.user_name,
        currentName: member.user_name,
        isModified: false
      }));
      setOriginalMembers(memberStates);
    }
  }, [members]);

  // 변경사항 실시간 감지
  useEffect(() => {
    if (!originalGroupName) return; // 초기 로딩 중이면 무시

    const groupNameChanged = formData.groupName !== originalGroupName;
    const passwordChanged = formData.password !== originalPassword;
    const hasMemberChanges = originalMembers.some(member => member.isModified);
    const hasNewMembers = addedMembers.some(member => member.name.trim());
    const treasurerChanged = treasurerMemberId !== (originalTreasurerMemberId || '');

    setHasChanges(groupNameChanged || passwordChanged || hasMemberChanges || hasNewMembers || treasurerChanged);
  }, [formData.groupName, originalGroupName, originalMembers, addedMembers, formData.password, originalPassword, treasurerMemberId, originalTreasurerMemberId]);

  // 로딩 중
  if (groupLoading || membersLoading) return null;

  // 그룹이 존재하지 않으면 리다이렉트
  if (!group) {
    router.replace('/groups');
    return null;
  }

  // 기존 멤버 이름 변경 핸들러
  const handleMemberNameChange = (memberId: string, newName: string) => {
    setOriginalMembers(prev => 
      prev.map(member => 
        member.id === memberId 
          ? { 
              ...member, 
              currentName: newName,
              isModified: newName !== member.originalName
            }
          : member
      )
    );
  };

  // 새 멤버 추가 핸들러
  const handleAddMember = () => {
    const newMember: AddedMember = {
      id: `temp_${Date.now()}`,
      name: ''
    };
    setAddedMembers(prev => [...prev, newMember]);
  };

  // 새 멤버 이름 변경 핸들러
  const handleAddedMemberNameChange = (memberId: string, newName: string) => {
    setAddedMembers(prev => 
      prev.map(member => 
        member.id === memberId 
          ? { ...member, name: newName }
          : member
      )
    );
  };

  // 새 멤버 삭제 핸들러
  const handleRemoveAddedMember = (memberId: string) => {
    setAddedMembers(prev => prev.filter(member => member.id !== memberId));
  };

  // 수정 사항 추적
  const getChanges = (data: EditGroupForm) => {
    const changes: {
      groupName?: string;
      password?: string;
      membersToRename?: {memberId: string, newName: string}[];
      membersToAdd?: string[];
      treasurerMemberId?: string | null;
    } = {};

    // 그룹 이름 변경 확인
    if (data.groupName !== originalGroupName) {
      changes.groupName = data.groupName;
    }

    // 비밀번호 변경 확인
    if (data.password !== originalPassword) {
      changes.password = data.password;
    }

    // 멤버 이름 변경 확인
    const modifiedMembers = originalMembers.filter(member => member.isModified && member.currentName.trim());
    if (modifiedMembers.length > 0) {
      changes.membersToRename = modifiedMembers.map(member => ({
        memberId: member.id,
        newName: member.currentName.trim()
      }));
    }

    // 새 멤버 추가 확인
    const validNewMembers = addedMembers.filter(member => member.name.trim());
    if (validNewMembers.length > 0) {
      changes.membersToAdd = validNewMembers.map(member => member.name.trim());
    }

    // 총무 변경/해제 확인
    if (treasurerMemberId !== (originalTreasurerMemberId || '')) {
      changes.treasurerMemberId = treasurerMemberId ? treasurerMemberId : null;
    }

    return changes;
  };

  // 폼 validation
  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.groupName.trim()) {
      newErrors.groupName = '그룹 이름을 입력해주세요';
    }
    
    if (formData.password && formData.password.length !== 4) {
      newErrors.password = '4자리 숫자로 입력해주세요';
    }

    // 빈 이름 체크
    const hasEmptyOriginalNames = originalMembers.some(member => !member.currentName.trim());
    const hasEmptyAddedNames = addedMembers.some(member => !member.name.trim());

    if (hasEmptyOriginalNames || hasEmptyAddedNames) {
      newErrors.members = '멤버 이름은 비워둘 수 없습니다';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    if (isLoadingRef.current) return;
    
    if (!validateForm()) return;
    
    if (!isInternetReachable) {
      Toast.show({
        type: 'error',
        text1: '네트워크 연결이 필요해요',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      isLoadingRef.current = true;

      const changes = getChanges(formData);

      await editGroupMutation.mutateAsync({
        groupId: groupId as string,
        ...changes
      });

      Toast.show({
        type: 'success',
        text1: '그룹이 수정되었어요',
      });
      router.back();
    } catch (error) {
      console.error('Error editing group:', error);
      // 에러는 mutation의 onError에서 처리됨
    } finally {
      setIsSubmitting(false);
      isLoadingRef.current = false;
    }
  };

  // 비밀번호 입력 핸들러
  const handlePasswordChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 4);
    setFormData(prev => ({ ...prev, password: numericText }));
    setErrors((prev: any) => ({ ...prev, password: '' }));
  };

  const currencyItems = Object.entries(currencies).map(([code, { name }]) => ({
    label: `${name} (${code})`,
    value: code,
    title: `${name} (${code})`
  }));

  return (
    <SafeAreaView edges={Platform.OS === 'ios' ? ['top'] : ['top', 'bottom']} className="relative flex-1 bg-white">
      <Header 
        title="그룹 수정" 
        showBackButton={true}
        onBackClick={() => router.back()}
      />
      <KeyboardAwareScrollView
        bottomOffset={50}
        style={{ flex: 1 }}
        className="flex-1 px-4 pt-16"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: Platform.OS === "ios" ? 0 : insets.bottom }}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        alwaysBounceVertical={false}
      >
        {/* 그룹 이름 */}
        <View className="mb-6">
          <FormLabel label="그룹 이름" />
          <View className="relative">
            <InputField
              placeholder="그룹 이름을 입력해주세요"
              value={formData.groupName}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, groupName: text }));
                setErrors((prev: any) => ({ ...prev, groupName: '' }));
              }}
              maxLength={12}
              returnKeyType="done"
            />
            {formData.groupName !== originalGroupName && formData.groupName && (
              <View className="absolute right-3 top-1/2 -translate-y-1/2">
                <MediumText className="text-blue-500 text-sm">변경됨</MediumText>
              </View>
            )}
          </View>
          {errors.groupName && (
            <MediumText className="text-red-500 text-sm mt-1 ml-1">{errors.groupName}</MediumText>
          )}
        </View>

        {/* 정산 통화 (비활성화) */}
        <View className="mb-6">
          <FormLabel label="정산 통화" />
          <SelectField
            value={formData.currency}
            onChangeValue={() => {}} // 비활성화
            items={currencyItems}
            disabled={true}
          />
        </View>

        {/* 비밀번호 */}
        <View className="mb-6">
          <FormLabel label="입장 비밀번호 (선택)" />
          <View className="relative">
            <InputField
              placeholder="4자리 숫자 입력 (선택)"
              value={formData.password}
              onChangeText={handlePasswordChange}
              keyboardType="numeric"
              maxLength={4}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
            {formData.password !== originalPassword && (
              <View className="absolute right-3 top-1/2 -translate-y-1/2">
                <MediumText className="text-blue-500 text-sm">변경됨</MediumText>
              </View>
            )}
          </View>
          {errors.password && (
            <MediumText className="text-red-500 text-sm mt-1 ml-1">{errors.password}</MediumText>
          )}
        </View>

        {/* 총무 변경/해제 */}
        {originalMembers.length >= 3 && (
          <View className="mb-6">
            <FormLabel label="총무 변경" />
            <SelectField
              value={treasurerMemberId}
              onChangeValue={(value) => setTreasurerMemberId(value || '')}
              items={[
                { label: '총무 없음(기본값)', title: '총무 없음(기본값)', value: '' },
                ...originalMembers
                  .filter((m) => m.currentName.trim())
                  .map((m) => ({
                    label: `총무: ${m.currentName}`,
                    title: `총무: ${m.currentName}`,
                    value: m.id,
                  })),
              ]}
            />
            <MediumText className="text-gray-500 text-sm mt-1 ml-1">
              선택 시 총무를 통해서만 송금이 오가도록 정산돼요
            </MediumText>
          </View>
        )}

        {/* 멤버 목록 */}
        <View className="mb-8">
          <FormLabel label="멤버 이름변경" />
          
          {/* 기존 멤버들 */}
          <View className="flex flex-col gap-2 mb-2">
            {originalMembers.map((member) => (
              <View key={member.id} className="relative">
                <InputField
                  placeholder="멤버 이름"
                  value={member.currentName}
                  onChangeText={(text) => handleMemberNameChange(member.id, text)}
                  returnKeyType="done"
                />
                {member.isModified && (
                  <View className="absolute right-3 top-1/2 -translate-y-1/2">
                    <MediumText className="text-blue-500 text-sm">변경됨</MediumText>
                  </View>
                )}
              </View>
            ))}
            
            {/* 새로 추가된 멤버들 */}
            {addedMembers.map((member) => (
              <View key={member.id} className="relative">
                <InputField
                  placeholder="새 멤버 이름"
                  value={member.name}
                  onChangeText={(text) => handleAddedMemberNameChange(member.id, text)}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  onPress={() => handleRemoveAddedMember(member.id)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-100 rounded-full p-1"
                  activeOpacity={0.7}
                >
                  <X width={16} height={16} color="#6B7280" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          {/* 멤버 추가 버튼 */}
          <TouchableOpacity
            onPress={handleAddMember}
            className="h-12 flex items-start justify-center"
            activeOpacity={0.7}
          >
            <MediumText className="text-blue-500 text-base">+ 멤버 추가하기</MediumText>
          </TouchableOpacity>
          
          {errors.members && (
            <MediumText className="text-red-500 text-sm mt-1 ml-1">{errors.members}</MediumText>
          )}
        </View>

        {/* 수정 버튼 */}
        <View className="pb-8">
          <PrimaryButton
            title={isSubmitting || editGroupMutation.isPending ? '처리 중...' : '수정하기'}
            onPress={handleSubmit}
            disabled={!hasChanges || isSubmitting || editGroupMutation.isPending}
            loading={isSubmitting || editGroupMutation.isPending}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
