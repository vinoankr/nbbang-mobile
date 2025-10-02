import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { BoldText } from './Texts';
import ExpensesList from './ExpensesList';
import SettlementResults from './SettlementResults';
import { useLocalSearchParams } from 'expo-router';
import { useGroupExpenses } from '@/src/hooks/queries/useGroupExpenses';
import { useAllExpenseParticipations } from '@/src/hooks/queries/useAllExpenseParticipations';
import { useGroupedExpenses } from '@/src/hooks/useGroupedExpenses';
import { calculateSettlement } from '@/src/utils/settlementCalculator';

interface Member {
  id: string;
  user_name: string;
  user_id: string | null;
}

interface GroupDetailTabsProps {
  groupId: string;
  currency: string;
  currentUser: any;
  currentUserMemberId: string;
  members: Member[];
  memberNameMap: Map<string, string>;
  isMemberOfGroup: boolean;
  openInviteModal: () => void;
  isLoading: boolean;
}

const GroupDetailTabs: React.FC<GroupDetailTabsProps> = ({
  groupId,
  currency,
  currentUser,
  currentUserMemberId,
  members,
  memberNameMap,
  isMemberOfGroup,
  openInviteModal,
  isLoading = false,
}) => {
  
  const { activeTab: activeTabParam } = useLocalSearchParams() as { activeTab: 'expenses' | 'settlement' | null };

  const [activeTab, setActiveTab] = useState<'expenses' | 'settlement'>(activeTabParam || 'expenses');

  // 데이터 페칭
  const { data: rawExpenses, isLoading: expensesLoading, isError: expensesError } = useGroupExpenses(groupId, currentUser, isMemberOfGroup);
  const { data: allExpenseParticipations, isLoading: participationsLoading, isError: participationsError } = useAllExpenseParticipations(groupId, isMemberOfGroup);

  // 데이터 재구성 (memoized)
  const groupedExpenses = useGroupedExpenses(rawExpenses);
  
  const settlementData = useMemo(() => {
    return calculateSettlement(allExpenseParticipations, currentUserMemberId, members);
  }, [allExpenseParticipations, currentUserMemberId, members]);

  const numMyTransactions = settlementData.myTransactions.length || 0;

  // 각 탭별 로딩 상태
  const expensesTabLoading = expensesLoading || isLoading;
  const settlementTabLoading = participationsLoading || isLoading;

  return (
    <View className="flex-1">
      {/* 탭 메뉴 */}
      <View className="rounded-xl p-1.5 w-full flex-row justify-around items-center bg-gray-50 mb-6">
        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-lg ${
            activeTab === 'expenses' ? 'bg-blue-500' : 'bg-transparent'
          }`}
          activeOpacity={0.9}
          onPress={() => setActiveTab('expenses')}
        >
          <BoldText 
            className={`text-center text-[14px] ${
              activeTab === 'expenses' ? 'text-white' : 'text-gray-800'
            }`}
          >
            지출 내역
          </BoldText>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-lg ${
            activeTab === 'settlement' ? 'bg-blue-500' : 'bg-transparent'
          }`}
          activeOpacity={0.9}
          onPress={() => setActiveTab('settlement')}
        >
          <View className="flex-row items-center justify-center gap-1">
            <BoldText 
              className={`text-center text-[14px] ${
                activeTab === 'settlement' ? 'text-white' : 'text-gray-800'
              }`}
            >
              정산 결과
            </BoldText>
            {numMyTransactions > 0 && (
              <BoldText 
                className={`text-xs ${
                  activeTab === 'settlement' ? 'text-white' : 'text-gray-800'
                }`}
              >
                ({numMyTransactions})
              </BoldText>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {activeTab === 'expenses' ? (
        <ExpensesList 
          groupCurrency={currency as any} 
          memberNameMap={memberNameMap} 
          currentUserMemberId={currentUserMemberId}
          groupedExpenses={groupedExpenses}
          rawExpenses={rawExpenses}
          isLoading={expensesTabLoading}
          isError={expensesError}
        />
      ) : (
        <SettlementResults 
          groupId={groupId}
          groupCurrency={currency as any}
          currentMemberId={currentUserMemberId}
          members={members}
          memberNameMap={memberNameMap}
          openInviteModal={openInviteModal}
          allExpenseParticipations={allExpenseParticipations}
          settlementData={settlementData}
          isLoading={settlementTabLoading}
          isError={participationsError}
        />
      )}

    </View>
  );
};

export default GroupDetailTabs; 