import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { BoldText, MediumText } from './Texts';
import MyBalanceItem from './MyBalanceItem';
import OthersBalanceItem from './OthersBalanceItem';
import ChevronUp from '../../assets/icons/chevron-up.svg';
import ChevronDown from '../../assets/icons/chevron-down.svg';
import Spinner from './Spinner';
import Toast from 'react-native-toast-message';
import { formatCurrency } from '../utils/formatter';
import { ClipboardCopy } from 'lucide-react-native';
import SettlementSummary from './SettlementSummary';
import { SettlementResult, Transaction } from '../utils/settlementCalculator';
import { CurrencyCode } from '../constants/currencies';

interface Member {
  id: string;
  user_name: string;
  user_id: string | null;
}

interface SettlementResultsProps {
  currentMemberId: string;
  members: Member[];
  memberNameMap: Map<string, string>;
  groupId: string;
  groupCurrency: CurrencyCode;
  treasurerMemberId?: string;
  openInviteModal: () => void;
  allExpenseParticipations: any[] | undefined;
  settlementData: SettlementResult;
  isLoading: boolean;
  isError: boolean;
}

const SettlementResults: React.FC<SettlementResultsProps> = ({
  currentMemberId,
  members,
  memberNameMap,
  groupId,
  groupCurrency,
  treasurerMemberId,
  openInviteModal,
  allExpenseParticipations,
  settlementData,
  isLoading,
  isError
}) => {
  const [isOthersTransactionsOpen, setIsOthersTransactionsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCompleteCopy, setIsCompleteCopy] = useState(false);
  const { myTransactions, othersTransactions } = settlementData;


  const getSettlementResultText = () => {
    let text = '';
    const allTransactions = [...myTransactions, ...othersTransactions];
    // 보내는 사람별로 그룹화
    const transactionsByFrom = new Map<string, Transaction[]>();
    
    allTransactions.forEach((transaction) => {
      const fromId = transaction.from;
      if (!transactionsByFrom.has(fromId)) {
        transactionsByFrom.set(fromId, []);
      }
      transactionsByFrom.get(fromId)!.push(transaction);
    });

    // 각 보내는 사람별로 텍스트 생성
    transactionsByFrom.forEach((transactions, fromId) => {
      const fromName = memberNameMap.get(fromId) || '알 수 없음';
      
      text += `${fromName}님,`;
      transactions.forEach((transaction) => {
        const toName = memberNameMap.get(transaction.to) || '알 수 없음';
        const amount = formatCurrency(transaction.amount, groupCurrency as any);
        text += ` ${toName}님께 ${amount} 송금하세요.\n`;
      });
      text += '\n';
    });

    return text;
  }

  // 송금 내역을 텍스트로 변환하는 함수
  const generateSettlementShareText = () => {
    let text = '엔빵 정산 결과:\n\n';
    text += getSettlementResultText();
    text += '자세한 내역을 보려면 아래 링크에서 확인하세요';
    text += '\nhttps://nbbang.app/groups/' + groupId;
    
    return text;
  };

  // 클립보드에 복사하는 함수
  const copySettlementToClipboard = async () => {
    try {
      const settlementText = generateSettlementShareText();
      await Clipboard.setStringAsync(settlementText);
      setIsCompleteCopy(true);
      setTimeout(() => {
        setIsCompleteCopy(false);
      }, 3000);
      Toast.show({
        type: 'success',
        text1: '정산 결과가 클립보드에 복사되었습니다',
        text2: '다른 앱에서 붙여넣기 할 수 있어요!',
      });
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      Toast.show({
        type: 'error',
        text1: '복사에 실패했습니다',
        text2: '다시 시도해주세요.',
      });
    }
  };

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
        <View className="w-full flex flex-col gap-2.5 mb-8">
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
                  다른 멤버간 정산 결과 {isOthersTransactionsOpen ? '닫기' : '보기'}
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
            !!treasurerMemberId &&
            othersTransactions.length === 0 &&
            myTransactions.length > 0 && (
              <TouchableOpacity
                className="py-3.5 px-4 border border-gray-100 rounded-lg flex flex-col"
                onPress={() => setIsShareOpen(!isShareOpen)}
                activeOpacity={0.9}
              >
                <View className="flex-row justify-between items-center">
                  <BoldText className="text-gray-800 text-base">
                    { isShareOpen ? '정산결과 전체 내역:' : '정산결과 전체 복사하기' }
                  </BoldText>
                  {isShareOpen ? <ChevronUp width={16} height={16} /> : <ChevronDown width={16} height={16} />}
                </View>
                {isShareOpen && (
                  <View className="flex flex-col mt-2">
                    <MediumText className="text-gray-600 text-sm">
                      {getSettlementResultText()}
                    </MediumText>
                    <TouchableOpacity
                      className="py-3.5 px-4 bg-blue-500 rounded-lg flex flex-row gap-1 items-center justify-center -mt-4"
                      onPress={copySettlementToClipboard}
                      activeOpacity={0.8}
                    >
                      <ClipboardCopy width={16} height={16} color="white" />
                      <BoldText className="text-white text-base">
                        클립보드에 복사{isCompleteCopy ? '완료' : '하기'}
                      </BoldText>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            )
          }
          {myTransactions.length > 0 && (
            <SettlementSummary summary={settlementData.summary} currency={groupCurrency} />
          )}
        </View>
      )}
    </View>
  );
};

export default SettlementResults;
