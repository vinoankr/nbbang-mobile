import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLedger } from '@/src/hooks/useLedger';
import { useGroupExpenses } from '@/src/hooks/queries/useGroupExpenses';
import { getUserData } from '@/src/utils/client';
import { formatCurrency } from '@/src/utils/formatter';
import { useAllExpenseParticipations } from '@/src/hooks/queries/useAllExpenseParticipations';
import { useGroupMembers } from '@/src/hooks/queries/useGroupMembers';
import { useGroupInfo } from '@/src/hooks/queries/useGroupInfo';
import Header from '@/src/components/Header';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BoldText, MediumText } from '@/src/components/Texts';
import { MenuView } from '@react-native-menu/menu';

export default function LedgerPage() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();

  const insets = useSafeAreaInsets()
  
  const { data: group, isLoading: groupLoading, isError: groupError } = useGroupInfo(groupId);
  const { data: allExpenseParticipations, isLoading: partiLoading, isError: partiError } = useAllExpenseParticipations(groupId, true);
  const { data: allExpenses, isLoading: expLoading, isError: expError } = useGroupExpenses(groupId, getUserData(), true);
  const { data: members, isLoading: membersLoading, isError: membersError } = useGroupMembers(groupId);

  const [selectedMember, setSelectedMember] = useState<string>("");
  const { ledger, totalSpending } = useLedger(allExpenses, allExpenseParticipations, selectedMember);
  
  const currentUser = getUserData();
  const groupCurrency = group?.default_currency;

  useEffect(() => {
    const currentUserMemberId = members?.find((member : any) => member.user_id === currentUser?.id)?.id || null;
    if (!!currentUserMemberId) {
      setSelectedMember(currentUserMemberId);
    }
  }, [members, currentUser?.id]);

  const isLoading = partiLoading || groupLoading || membersLoading || expLoading;
  const isError = partiError || groupError || membersError || expError;

  if (isError || !groupId) {
    return (
      <View className="flex-1 p-4 pt-8">
        <MediumText className="text-gray-800 mb-4">그룹 정보를 불러오는데 실패했습니다.</MediumText>
        <MediumText
          className="text-blue-600 underline"
          onPress={() => router.back()}
        >
          목록으로
        </MediumText>
      </View>
    );
  }
  
  return (
    <SafeAreaView edges={Platform.OS === 'ios' ? ['top'] : ['top', 'bottom']} className="relative flex-1 bg-white">
      <Header
        title={group?.name || '지출 추가'} 
        showBackButton={true}
        onBackClick={() => router.back()} 
        applyInsets={Platform.OS !== 'ios'}
      />
        <ScrollView
          style={{ flex: 1 }}
          className="px-4 pt-16"
          keyboardShouldPersistTaps="handled"
          bounces={false}
          alwaysBounceVertical={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: Platform.OS === "ios" ? 0 : insets.bottom }}
        >
          <View className="flex-row justify-between items-end mb-4">
            <BoldText className="text-2xl">사용한 금액</BoldText>

            <MenuView
              actions={members?.map((m: any) => ({
                id: m.id,
                title: m.user_name,
                state: selectedMember === m.id ? 'on' : 'off'
              })) || []}
              onPressAction={({ nativeEvent }) => {
                setSelectedMember(nativeEvent.event);
              }}
            >
              <View className="bg-gray-50 rounded-lg px-3 py-2 flex-row items-center">
                <MediumText className="text-gray-800 text-base mr-2">
                  {selectedMember
                    ? members?.find((m: any) => m.id === selectedMember)?.user_name || '--선택--'
                    : '--선택--'
                  }
                </MediumText>
                <MediumText className="text-gray-500">▼</MediumText>
              </View>
            </MenuView>
          </View>

        {isLoading && (
          <View className="flex-1 justify-center items-center py-16">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        )}

        {selectedMember && !isLoading && (
          <View className="border border-[#E1EDFF] rounded-xl overflow-hidden bg-[#E1EDFF] mb-20">
            <View className="flex-row justify-between px-4 py-3">
              <BoldText className="text-lg font">총 지출</BoldText>
              <BoldText className="text-lg font text-blue-500">
                {!groupCurrency ? '...' : formatCurrency(totalSpending, groupCurrency)}
              </BoldText>
            </View>
            <View className="flex flex-col p-4 gap-3.5 bg-white rounded-xl">
              {ledger.map((row, idx) => (
                <View key={idx} className="flex flex-col gap-3">
                  {row.showDate && idx !== 0 && (
                    <View className="h-[1px] bg-gray-50" />
                  )}
                  {row.showDate && (
                    <MediumText className="text-base text-gray-400">
                      {row.date}
                    </MediumText>
                  )}
                  <View className="flex-row justify-between">
                    <MediumText className='text-base'>{row.description?.substring(0,20)}</MediumText>
                    <BoldText className="text-base text-right">
                      {formatCurrency(row.amount, row.currency as any)}
                    </BoldText>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}