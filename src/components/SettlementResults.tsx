import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { BoldText, MediumText } from './Texts';
import MyBalanceItem from './MyBalanceItem';
import OthersBalanceItem from './OthersBalanceItem';
import ChevronUp from '../../assets/icons/chevron-up.svg';
import ChevronDown from '../../assets/icons/chevron-down.svg';
import Spinner from './Spinner';

interface Member {
  id: string;
  user_name: string;
  user_id: string | null;
}

interface Transaction {
  from: string;
  to: string;
  amount: number;
}

interface SettlementData {
  myTransactions: Transaction[];
  othersTransactions: Transaction[];
  totalAmount: number;
}

interface SettlementResultsProps {
  currentMemberId: string;
  members: Member[];
  memberNameMap: Map<string, string>;
  groupId: string;
  groupCurrency: string;
  openInviteModal: () => void;
  allExpenseParticipations: any[] | undefined;
  settlementData: SettlementData;
  isLoading: boolean;
  isError: boolean;
}

const SettlementResults: React.FC<SettlementResultsProps> = ({
  currentMemberId,
  members,
  memberNameMap,
  groupId,
  groupCurrency,
  openInviteModal,
  allExpenseParticipations,
  settlementData,
  isLoading,
  isError
}) => {
  const [isOthersTransactionsOpen, setIsOthersTransactionsOpen] = useState(false);
  const [isWhyThisAmountOpen, setIsWhyThisAmountOpen] = useState(false);

  const { myTransactions, othersTransactions } = settlementData;

  if (isLoading || !currentMemberId) {
    return (
      <View className="flex justify-center items-center py-16">
        <Spinner size={24} color="#30333D" strokeWidth={2.5} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="w-full container mx-auto px-4 py-8">
        <MediumText className="text-center text-xl">
          데이터를 받아오는데 실패했습니다.
        </MediumText>
      </View>
    );
  }

  return (
    <View className="space-y-4">
      {allExpenseParticipations && allExpenseParticipations.length === 0 ? (
        <View className="flex justify-center items-center my-8">
          <MediumText className="text-gray-500 text-base text-center mb-2">
            등록된 지출 내역이 없어 정산 결과가 없습니다.
          </MediumText>
          <MediumText className="text-gray-500 text-base text-center">
            하단의 + 버튼을 눌러 지출 내역을 등록해주세요.
          </MediumText>
        </View>
      ) : (
        <View className="w-full flex flex-col gap-2 mb-16">
          {myTransactions.length === 0 && othersTransactions.length === 0 ? (
            <View className="py-8 text-center">
              <MediumText className="text-lg text-gray-800 text-center">
                👍 모든 정산이 완료되었어요!
              </MediumText>
            </View>
          ) : myTransactions.length === 0 ? (
            <View className="py-4 text-center">
              <MediumText className="text-lg text-gray-800 text-center">
                👍 {memberNameMap.get(currentMemberId)}님은 정산이 완료되었어요!
              </MediumText>
            </View>
          ) : (
            myTransactions.map((transaction: any) => (
              <MyBalanceItem
                key={transaction.to + transaction.from + transaction.amount}
                groupId={groupId}
                members={members}
                myMemberId={currentMemberId}
                memberNameMap={memberNameMap}
                to={transaction.to}
                from={transaction.from}
                amount={transaction.amount}
                currency={groupCurrency as any}
                openInviteModal={openInviteModal}
              />
            ))
          )}
          
          {othersTransactions.length > 0 && (
            <TouchableOpacity
              className="py-3.5 px-4 border border-gray-100 rounded-lg flex flex-col"
              onPress={() => setIsOthersTransactionsOpen(!isOthersTransactionsOpen)}
              activeOpacity={0.9}
            >
              <View className="flex-row justify-between items-center">
                <BoldText className="text-gray-800 text-base">
                  다른 멤버간 정산 결과
                </BoldText>
                {isOthersTransactionsOpen ? <ChevronUp width={16} height={16} /> : <ChevronDown width={16} height={16} />}
              </View>
              
              {isOthersTransactionsOpen && (
                <View className="flex flex-col mt-1.5">
                  {othersTransactions.map((transaction: any, index: number) => (
                    <View key={transaction.to + transaction.from + transaction.amount}>
                      {index > 0 && <View className="h-px bg-gray-100 my-1" />}
                      <OthersBalanceItem
                        groupId={groupId}
                        myMemberId={currentMemberId}
                        memberNameMap={memberNameMap}
                        to={transaction.to}
                        from={transaction.from}
                        amount={transaction.amount}
                        currency={groupCurrency as any}
                      />
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          )}
          {
            (myTransactions.length > 0 || othersTransactions.length > 0) && members?.length > 2 && (
              <TouchableOpacity
                className="py-3.5 px-4 border border-gray-100 rounded-lg flex flex-col"
                onPress={() => setIsWhyThisAmountOpen(!isWhyThisAmountOpen)}
                activeOpacity={0.9}
              >
                <View className="flex-row justify-between items-center">
                  <BoldText className="text-gray-600 text-base">
                    왜 이런 정산 결과가 나왔나요?
                  </BoldText>
                  {isWhyThisAmountOpen ? <ChevronUp width={16} height={16} /> : <ChevronDown width={16} height={16} />}
                </View>
                {isWhyThisAmountOpen && (
                  <View className="flex flex-col mt-2">
                    <MediumText className="text-gray-600 text-sm">
                      N빵은 송금 횟수를 최소화하는 알고리즘을 사용해요!
                    </MediumText>
                    <MediumText className="text-gray-600 text-sm">
                      예상한 결과와 달라도 안심하고 사용해주세요 🤗
                    </MediumText>
                    <MediumText className="text-gray-600 text-sm mt-1.5">
                      예시: A → B, B → C로 각각 송금해야 하는 경우, A → C로 직접 송금하도록 알고리즘이 작동합니다.
                    </MediumText>
                  </View>
                )}
              </TouchableOpacity>
            )
          }
        </View>
      )}
    </View>
  );
};

export default SettlementResults; 