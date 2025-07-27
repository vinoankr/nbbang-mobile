import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, Pressable } from 'react-native';
import { MenuView } from '@react-native-menu/menu';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useNetInfo } from '@react-native-community/netinfo';

import { useGroupInfo } from '@/src/hooks/queries/useGroupInfo';
import { useGroupMembers } from '@/src/hooks/queries/useGroupMembers';
import { useEditExpense } from '@/src/hooks/mutations/useEditExpense';
import { useDeleteExpense } from '@/src/hooks/mutations/useDeleteExpense';
import { useExpenseForm } from '@/src/hooks/useExpenseForm';
import { useExpenseById } from '@/src/hooks/queries/useExpense';
import { useExpenseParticipants } from '@/src/hooks/queries/useExpenseParticipants';
import { useParsedCurrencyRates } from '@/src/hooks/useParsedCurrencyRates';
import { getUserData } from '@/src/utils/client';
import { currencies, CurrencyCode } from '@/src/constants/currencies';
import { formatCurrency } from '@/src/utils/formatter';

import Header from '@/src/components/Header';
import { FormLabel } from '@/src/components/form/FormLabel';
import { InputField } from '@/src/components/form/InputField';
import { SelectField } from '@/src/components/form/SelectField';
import { DateTimePickerField } from '@/src/components/form/DateTimePickerField';
import { CheckboxField } from '@/src/components/form/CheckboxField';
import { PrimaryButton } from '@/src/components/form/PrimaryButton';
import { SecondaryButton } from '@/src/components/form/SecondaryButton';
import { MediumText, BoldText, RegularText, SemiBoldText } from '@/src/components/Texts';
import Spinner from '@/src/components/Spinner';
import { X } from 'lucide-react-native';
import { DangerousButton } from '@/src/components/form/DangerousButton';

export default function EditExpense() {
  const { groupId, expenseId } = useLocalSearchParams<{ groupId: string; expenseId: string }>();
  const router = useRouter();
  const currentUser = getUserData();
  const { isConnected } = useNetInfo();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const isSubmittingRef = useRef(false);
  
  // 데이터 로딩
  const { data: group, isLoading: groupLoading, isError: groupError } = useGroupInfo(groupId);
  const { data: members, isLoading: membersLoading, isError: membersError } = useGroupMembers(groupId);
  const { data: expense, isLoading: expenseLoading, isError: expenseError } = useExpenseById(expenseId);
  const { data: participants, isLoading: participantsLoading, isError: participantsError } = useExpenseParticipants(expenseId, true);
  const { currencyMap, isLoading: currenciesLoading, isError: currenciesError } = useParsedCurrencyRates();
  
  const { mutateAsync: editExpense } = useEditExpense();
  const { mutateAsync: deleteExpense } = useDeleteExpense();
  const defaultCurrency = group?.default_currency as CurrencyCode;
  
  const isLoading = groupLoading || membersLoading || currenciesLoading || expenseLoading || participantsLoading;
  const isError = groupError || membersError || currenciesError || expenseError || participantsError;
  
  // useExpenseForm 훅 사용
  const {
    title,
    setTitle,
    amount,
    amountForDisplay,
    paidBy,
    setPaidBy,
    receiverId,
    setReceiverId,
    spentAt,
    setSpentAt,
    currency,
    setCurrency,
    exchangeRate,
    exchangeRateInput,
    expenseType,
    setExpenseType,
    splitType,
    setSplitType,
    participants: selectedParticipants,
    multipliers,
    manualAmounts,
    formattedManualAmounts,
    errors,
    onAmountChange,
    onAmountBlur,
    onExchangeRateChange,
    onExchangeRateBlur,
    toggleParticipant,
    adjustMultiplier,
    handleManualAmountInputChange,
    handleManualAmountBlur,
    calculateShare,
    getParticipantsWithAmount,
    validateManualAmounts,
    validateForm,
    setInitialDataForEdit,
  } = useExpenseForm({
    members: members ?? [],
    currentUser,
    defaultCurrency,
    currencyMap,
  });

  const currencyItems = useMemo(() => 
    Object.entries(currencies).map(([code, { name }]) => ({
      label: code,
      title: `${name} (${code})`,
      value: code
    }))
  , []);

  const memberItems = useMemo(() => 
    members?.map((member: any) => ({
      label: member.user_name,
      title: member.user_name,
      value: member.id
    })) ?? []
  , [members]);

  const receiverItems = useMemo(() => 
    members?.filter((member: any) => member.id !== paidBy).map((member: any) => ({
      label: member.user_name,
      title: member.user_name,
      value: member.id
    })) ?? []
  , [members, paidBy]);

  useEffect(() => {
    if(receiverItems.length === 1 && expenseType === '송금기록') {
      setReceiverId(receiverItems[0].value);
    }
  }, [receiverItems, expenseType]);

  // 데이터가 로드되면 폼 초기화
  useEffect(() => {
    if (!isDataInitialized && 
        !isLoading && 
        expense && 
        participants && 
        members && 
        defaultCurrency) {
      
      // 참가자 데이터 가공
      const participantsWithAmount = participants.map((p: any) => ({
        id: p.member_id,
        amount: p.amount_in_currency
      }));

      // 초기 데이터 설정
      setInitialDataForEdit({
        title: expense.title,
        amount: expense.amount_in_currency,
        paidBy: expense.paid_by,
        currency: expense.currency,
        exchangeRate: expense.exchange_rate,
        spentAt: expense.spent_at,
        participants: participantsWithAmount,
        isTransfer: expense.is_transfer,
        splitType: expense.split_type as any
      });

      setIsDataInitialized(true);
    }
  }, [isLoading, expense, participants, members, defaultCurrency, isDataInitialized, setInitialDataForEdit]);

  const handleDelete = async () => {
    if (!expenseId) return;
    
    Alert.alert(
      `지출 삭제`,
      '이 지출 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteExpense(expenseId);
              router.back();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: `삭제 오류: ${error.message}`,
              });
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    
    if (!validateForm()) return;
    
    if (!isConnected) {
      Toast.show({
        type: 'error',
        text1: '네트워크 연결이 필요해요',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      isSubmittingRef.current = true;
      
      if (expenseType === '지출기록') {
        // 수동 입력 방식일 경우 금액 검증
        if (splitType === 'amounts') {
          const validation = validateManualAmounts();
          if (!validation.isValid) {
            Toast.show({
              type: 'error',
              text1: validation.message,
            });
            return;
          }
        }
        
        // 참가자별 금액 계산
        const participantsWithAmount = getParticipantsWithAmount();
        const maxFractionDigits = currencies[defaultCurrency].maximumFractionDigits;
        const amountInDefaultCurrency = Number((amount * exchangeRate).toFixed(maxFractionDigits));
        
        const participantsWithAmountInDefaultCurrency = participantsWithAmount.map(participant => ({
          ...participant,
          amount: Number((participant.amount * exchangeRate).toFixed(maxFractionDigits)),
          amountInCurrency: Number(participant.amount.toFixed(currencies[currency].maximumFractionDigits))
        }));

        await editExpense({
          expenseId,
          groupId,
          title,
          amount: amountInDefaultCurrency,
          amountInCurrency: amount,
          currency: currency,
          exchangeRate: exchangeRate,
          paidBy,
          participants: participantsWithAmountInDefaultCurrency,
          isTransfer: false,
          splitType: splitType,
          spentAt,
          createdAt: expense?.created_at ? new Date(expense.created_at) : undefined
        });
      } else {
        // 송금기록 처리
        if (!receiverId) {
          Toast.show({
            type: 'error',
            text1: '송금 받는 사람을 선택해주세요',
          });
          return;
        }

        const amountInDefaultCurrency = Number((amount * exchangeRate).toFixed(currencies[defaultCurrency].maximumFractionDigits));
        
        const participantsWithAmount = [{
          id: receiverId,
          amount: amountInDefaultCurrency,
          amountInCurrency: amount
        }];
        
        await editExpense({
          expenseId,
          groupId,
          title: '개인송금',
          amount: amountInDefaultCurrency,
          amountInCurrency: amount,
          currency: currency,
          exchangeRate: exchangeRate,
          paidBy,
          participants: participantsWithAmount,
          isTransfer: true,
          transferTo: receiverId,
          spentAt,
          createdAt: expense?.created_at ? new Date(expense.created_at) : undefined
        });
      }
      
      router.back();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: `오류: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  if (!groupId || !expenseId || !currentUser) {
    router.replace('/groups');
    return null;
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header title="지출 수정" showBackButton onBackClick={() => router.back()} />
        <View className="flex-1 justify-center items-center px-4">
          <MediumText className="text-red-500 text-base text-center">
            데이터를 불러오는 중 오류가 발생했습니다.
          </MediumText>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading || !currency || !defaultCurrency) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header title="지출 수정" showBackButton onBackClick={() => router.back()} />
        <View className="flex-1 justify-center items-center">
          <Spinner />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="relative flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <Header 
          title={group?.name || '지출 수정'} 
          showBackButton={true}
          onBackClick={() => router.back()} 
          applyInsets={Platform.OS === 'android'}
        />
        <ScrollView
          style={{ flex: 1 }}
          className="px-4 pt-16"
          keyboardShouldPersistTaps="handled"
          bounces={false}
          alwaysBounceVertical={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
        >
          {/* 지출 유형 (수정 불가) */}
          <View className="rounded-xl p-1 w-full flex-row justify-around items-center bg-gray-50 mb-4">
            <TouchableOpacity
              className={`flex-1 py-2 rounded-lg ${
                expenseType === '지출기록' ? 'bg-blue-500' : 'bg-transparent opacity-70'
              }`}
              activeOpacity={0.9}
              disabled={true}
            >
              <BoldText 
                className={`text-center text-[14px] ${
                  expenseType === '지출기록' ? 'text-white' : 'text-gray-800 opacity-70'
                }`}
              >
                지출 기록
              </BoldText>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2 rounded-lg ${
                expenseType === '송금기록' ? 'bg-blue-500' : 'bg-transparent opacity-70'
              }`}
              activeOpacity={0.9}
              disabled={true}
            >
              <BoldText 
                className={`text-center text-[14px] ${
                  expenseType === '송금기록' ? 'text-white' : 'text-gray-800 opacity-70'
                }`}
              >
                송금 기록
              </BoldText>
            </TouchableOpacity>
          </View>

          {/* 금액 */}
          <FormLabel label="금액" />
          <View className="mb-4 flex-row items-start gap-2">
            <View className="w-[88px]">
              <SelectField
                value={currency}
                onChangeValue={(value) => setCurrency(value as CurrencyCode)}
                items={currencyItems}
              />
            </View>
            <View className="flex-1">
              <InputField
                selectTextOnFocus={true}
                placeholder={`${currencies[currency].symbol}0`}
                value={amountForDisplay}
                onChangeText={onAmountChange}
                onBlur={onAmountBlur}
                keyboardType="numeric"
                returnKeyType="done"
              />
              {errors.amount && (
                <MediumText className="text-red-500 text-sm mt-1 ml-1">{errors.amount}</MediumText>
              )}
            </View>
          </View>

          {/* 환율 입력 */}
          {currency !== defaultCurrency && (
            <View className="-mt-2 mb-4">
              <View className="flex-row items-center">
                <MediumText className="text-gray-500 text-base mr-2">
                  {currency} 1 = {defaultCurrency}
                </MediumText>
                <InputField
                  selectTextOnFocus={true}
                  value={exchangeRateInput}
                  onChangeText={onExchangeRateChange}
                  onBlur={onExchangeRateBlur}
                  keyboardType="numeric"
                  returnKeyType="done"
                  className="flex-1"
                />
              </View>
              {errors.exchangeRate && (
                <MediumText className="text-red-500 text-sm mt-1 ml-1">{errors.exchangeRate}</MediumText>
              )}
            </View>
          )}

          {/* 제목 */}
          <View className="mb-4">
            <FormLabel label="내용" />
            <InputField
              placeholder="간단한 내용을 입력하세요 (선택)"
              value={title}
              onChangeText={setTitle}
              selectTextOnFocus={true}
              editable={expenseType !== '송금기록'}
            />
            {errors.title && (
              <MediumText className="text-red-500 text-sm mt-1 ml-1">{errors.title}</MediumText>
            )}
          </View>

          {/* 결제자/송금자와 날짜 */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <FormLabel label={expenseType === '송금기록' ? '보낸 사람' : '결제한 사람'} />
              <SelectField
                value={paidBy}
                onChangeValue={(value) => setPaidBy(value || '')}
                items={memberItems}
              />
              {errors.paidBy && (
                <MediumText className="text-red-500 text-sm mt-1 ml-1">{errors.paidBy}</MediumText>
              )}
            </View>
            
            <View className="flex-1">
              <FormLabel label="날짜" />
              <DateTimePickerField
                value={spentAt}
                onChange={setSpentAt}
              />
            </View>
          </View>

          {/* 송금 받는 사람 (송금기록 선택 시) */}
          {expenseType === '송금기록' && (
            <View className="mb-6">
              <FormLabel label="받는 사람" />
              <SelectField
                value={receiverId}
                onChangeValue={(value) => setReceiverId(value || '')}
                items={receiverItems}
                placeholder="선택하세요"
              />
              {errors.receiverId && (
                <MediumText className="text-red-500 text-sm mt-1 ml-1">{errors.receiverId}</MediumText>
              )}
            </View>
          )}

          {/* 참가자 (지출기록 선택 시) */}
          {expenseType === '지출기록' && (
            <View className="mb-6">
              {/* 헤더와 분배 방식 드롭다운 */}
              <View className="flex-row justify-between items-center mb-1">
                <View className="flex-row items-center">
                  <SemiBoldText className="text-[17px] mr-1">
                    참가한 사람
                  </SemiBoldText>
                  <RegularText className="text-gray-500 text-sm">
                    ({selectedParticipants.size}명/{members?.length}명)
                  </RegularText>
                </View>
                
                {/* 메뉴 드롭다운 */}
                <MenuView
                  actions={[
                    {
                      id: 'equally',
                      title: 'N분의1',
                      state: splitType === 'equally' ? 'on' : 'off'
                    },
                    {
                      id: 'parts',
                      title: '배수입력',
                      state: splitType === 'parts' ? 'on' : 'off'
                    },
                    {
                      id: 'amounts',
                      title: '직접입력',
                      state: splitType === 'amounts' ? 'on' : 'off'
                    }
                  ]}
                  onPressAction={({ nativeEvent }) => {
                    setSplitType(nativeEvent.event as 'equally' | 'parts' | 'amounts');
                  }}
                >
                  <View className="bg-gray-50 rounded-lg px-3 py-2 flex-row items-center">
                    <MediumText className="text-gray-800 text-sm mr-2">
                      {splitType === 'equally' && 'N분의1'}
                      {splitType === 'parts' && '배수입력'}
                      {splitType === 'amounts' && '직접입력'}
                    </MediumText>
                    <MediumText className="text-gray-500">▼</MediumText>
                  </View>
                </MenuView>
              </View>
              
              {/* 참가자 리스트 - border로 감싸고 divide로 구분 */}
              <View className="border border-gray-100 rounded-lg">
                {members?.map((member: any, index: number) => {
                  const isSelected = selectedParticipants.has(member.id);
                  const share = calculateShare(member.id);
                  
                  return (
                    <View key={member.id} className={`flex-row items-center px-4 ${index < members.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      {/* 체크박스 (균등분할에서만 표시) */}
                      {splitType === 'equally' && (
                        <View className="flex-shrink-0 mr-2">
                          <CheckboxField
                            value={isSelected}
                            onValueChange={() => toggleParticipant(member.id)}
                          />
                        </View>
                      )}
                      
                      {/* 멤버 이름 */}
                      <Pressable 
                        className="flex-grow py-3.5"
                        onPress={() => splitType === 'equally' && toggleParticipant(member.id)}
                      >
                        <BoldText className="text-gray-800 text-[15px]">
                          {member.user_name} {member.user_id === currentUser?.id ? '(나)' : ''}
                        </BoldText>
                      </Pressable>
                      
                      {/* 분배 금액 또는 입력 UI */}
                      <View className="flex-shrink-0 ml-auto">
                        {splitType === 'equally' && (
                          <MediumText className="text-gray-600 text-base">
                            {isSelected && amount > 0 ? formatCurrency(share, currency) : `${currencies[currency].symbol}0`}
                          </MediumText>
                        )}
                        
                        {splitType === 'parts' && (
                          <View className="flex-row items-center">
                            {/* 금액 표시 */}
                            <MediumText className="text-gray-600 text-base mr-2">
                              {isSelected && amount > 0 ? formatCurrency(share, currency) : `${currencies[currency].symbol}0`}
                            </MediumText>
                            
                            {/* 배수 조정 버튼 */}
                            <View className="flex-row items-center">
                              <Pressable
                                onPress={() => adjustMultiplier(member.id, -1)}
                                disabled={multipliers[member.id] <= 0}
                                className={`w-6 h-6 rounded-md bg-gray-50 items-center justify-center ${
                                  multipliers[member.id] <= 0 ? 'opacity-30' : ''
                                }`}
                              >
                                <BoldText className="text-gray-800 text-lg">−</BoldText>
                              </Pressable>
                              
                              <View className="flex-row items-end mx-1">
                                <BoldText className="text-gray-800 text-base text-center self-end">
                                  {multipliers[member.id] || 0}
                                </BoldText>
                                <X width={12} height={12} color="#000" strokeWidth={4} style={{ marginBottom: 2 }} />
                              </View>
                              
                              <Pressable
                                onPress={() => adjustMultiplier(member.id, 1)}
                                className="w-6 h-6 rounded-md bg-gray-50 items-center justify-center"
                              >
                                <BoldText className="text-gray-800 text-lg">+</BoldText>
                              </Pressable>
                            </View>
                          </View>
                        )}
                        
                        {splitType === 'amounts' && (
                          <InputField
                            selectTextOnFocus={true}
                            value={formattedManualAmounts[member.id] || formatCurrency(manualAmounts[member.id] || 0, currency)}
                            returnKeyType="done"
                            onChangeText={(value) => handleManualAmountInputChange(member.id, value)}
                            onBlur={() => handleManualAmountBlur(member.id)}
                            keyboardType="numeric"
                            style={{ fontFamily: "Pretendard-500", textAlign: 'right', fontSize: 16, width: 100, height: 30, color: '#30333D', fontWeight: "500", }}
                            placeholder={`${currencies[currency].symbol}0`}
                            onSubmitEditing={(e) => e.target.blur()}
                          />
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* 삭제 및 수정 버튼 */}
          <View className="flex-row gap-2 pb-8">
            <DangerousButton
              title={isDeleting ? '삭제 중...' : '삭제하기'}
              onPress={handleDelete}
              disabled={isDeleting || isSubmitting}
              loading={isDeleting}
            />
            <PrimaryButton
              title={isSubmitting ? '처리 중...' : '수정하기'}
              onPress={handleSubmit}
              disabled={isSubmitting || isDeleting}
              loading={isSubmitting}
              doubleFlex={true}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 