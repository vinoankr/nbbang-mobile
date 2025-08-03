import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { BoldText } from './Texts';
import ExpensesList from './ExpensesList';
import SettlementResults from './SettlementResults';
import Spinner from './Spinner';
import { useLocalSearchParams } from 'expo-router';

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
          <BoldText 
            className={`text-center text-[14px] ${
              activeTab === 'settlement' ? 'text-white' : 'text-gray-800'
            }`}
          >
            정산 결과
          </BoldText>
        </TouchableOpacity>
      </View>

      {
        isLoading ? (
          <View className="flex-1 justify-center items-center py-16">
            <Spinner size={24} color="#30333D" strokeWidth={2.5} />
          </View>
        ) : (
          <>
            {activeTab === 'expenses' ? (
              <ExpensesList 
                groupId={groupId}
                groupCurrency={currency as any} 
                memberNameMap={memberNameMap} 
                currentUserMemberId={currentUserMemberId}
                currentUser={currentUser}
                isMemberOfGroup={isMemberOfGroup}
              />
            ) : (
              <SettlementResults 
                groupId={groupId}
                groupCurrency={currency as any}
                currentMemberId={currentUserMemberId}
                members={members}
                memberNameMap={memberNameMap}
                openInviteModal={openInviteModal}
                isMemberOfGroup={isMemberOfGroup}
              />
            )}
          </>
        )
      }

    </View>
  );
};

export default GroupDetailTabs; 