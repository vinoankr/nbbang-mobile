import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { BoldText, MediumText, SemiBoldText } from './Texts';
import { useExpenseParticipants } from '@/src/hooks/queries/useExpenseParticipants';
import { formatCurrency } from '@/src/utils/formatter';
import ChevronDown from '../../assets/icons/chevron-down.svg';
import ChevronUp from '../../assets/icons/chevron-up.svg';
import Pencil from '../../assets/icons/pencil.svg';
import { ArrowRightIcon } from 'lucide-react-native';
import Spinner from './Spinner';

interface CurrencyCode {
  code: string;
  symbol: string;
}

interface ExpensesListProps {
  expenses: any[];
  groupCurrency: CurrencyCode | string;
  memberNameMap: Map<string, string>;
  currentUserMemberId: string;
}

interface ExpenseCardProps {
  expense: any;
  groupCurrency: CurrencyCode | string;
  memberNameMap: Map<string, string>;
  currentUserMemberId: string;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ 
  expense, 
  groupCurrency, 
  memberNameMap, 
  currentUserMemberId 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const isCurrentUserPayer = expense.payer.id === currentUserMemberId;
  const { data: participants, isLoading: participantsLoading } = useExpenseParticipants(expense.id, isExpanded);

  const handleEdit = () => {
    router.push(`/groups/${expense.group_id}/edit-expense?expenseId=${expense.id}`);
  };

  return (
    <TouchableOpacity 
      className="bg-gray-50 border border-gray-100 rounded-lg p-4"
      onPress={() => setIsExpanded(!isExpanded)}
      activeOpacity={0.9}
    >
      <View className="flex-row justify-between mb-1.5">
        <BoldText className="text-gray-800 text-base flex-1">
          {expense.title}
        </BoldText>
        {expense.currency !== (typeof groupCurrency === 'string' ? groupCurrency : groupCurrency.code) && (
          <MediumText className="text-gray-400 text-base">
            {formatCurrency(expense.amount_in_currency, expense.currency)}
          </MediumText>
        )}
      </View>
      
      <View className="flex-row justify-between items-center">
        <View className="flex-1 flex-row items-center">
          {expense.is_transfer ? (
            <View className="flex-row items-center gap-0.5">
              <MediumText className="text-gray-500 text-base">
                {expense.payer.user_name}
              </MediumText>
              <ArrowRightIcon size={16} color="#6B7280" />
              <MediumText className="text-gray-500 text-base">
                {memberNameMap.get(expense.transfer_to)}
              </MediumText>
            </View>
          ) : (
            <MediumText className="text-gray-500 text-base">
              {expense.payer.user_name}{isCurrentUserPayer ? '(나)' : ''}
            </MediumText>
          )}
        </View>
        
        <BoldText className="text-lg text-gray-800">
          {formatCurrency(expense.amount, (typeof groupCurrency === 'string' ? groupCurrency : groupCurrency.code) as any)}
        </BoldText>
      </View>

      {isExpanded && (
        <View className="mt-3 pt-2.5 border-t border-white">
          <View className="flex-row justify-end items-end mb-1">
            <TouchableOpacity
              className="flex-row items-center gap-0.5 py-1.5 px-2 rounded-lg bg-white"
              onPress={handleEdit}
            >
              <Pencil width={16} height={16} />
              <BoldText className="text-gray-600 text-sm">수정</BoldText>
            </TouchableOpacity>
          </View>
          
          {!expense.is_transfer && (
            <View className="w-full items-center mt-1">
              {participantsLoading ? (
                <Spinner size={20} color="#30333D" strokeWidth={2.5} />
              ) : (
                <View className="w-full flex flex-col gap-1.5">
                  {participants
                    ?.sort((a: any) => a.member_id === currentUserMemberId ? -1 : 1)
                    .map((participant: any) => (
                      <View key={participant.id} className="flex-row justify-between w-full">
                        <BoldText className="text-gray-800 text-sm">
                          {memberNameMap.get(participant.member_id) || '-'}
                          {participant.member_id === currentUserMemberId ? '(나)' : ''}
                        </BoldText>
                                                 <MediumText className="text-gray-400 text-sm">
                           {formatCurrency(participant.amount, (typeof groupCurrency === 'string' ? groupCurrency : groupCurrency.code) as any)}
                         </MediumText>
                      </View>
                    ))
                  }
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const ExpensesList: React.FC<ExpensesListProps> = ({ 
  expenses, 
  groupCurrency, 
  memberNameMap, 
  currentUserMemberId 
}) => {
  if (expenses.length === 0) {
    return (
      <View className="flex justify-center items-center my-8">
        <MediumText className="text-gray-600 text-base text-center mb-2">
          등록된 지출 내역이 없습니다.
        </MediumText>
        <MediumText className="text-gray-600 text-base text-center">
          하단의 + 버튼을 눌러 지출 내역을 등록해주세요.
        </MediumText>
      </View>
    );
  }

  return (
    <View className="flex flex-col gap-6">
      {expenses.map((expense) => (
        <View key={expense.date} className="flex flex-col gap-2.5">
          <BoldText className="text-gray-800 text-lg">
            {expense.date}
          </BoldText>
          {expense.expenses.map((expenseItem: any) => (
            <ExpenseCard
              key={expenseItem.id}
              expense={expenseItem}
              groupCurrency={groupCurrency}
              memberNameMap={memberNameMap}
              currentUserMemberId={currentUserMemberId}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

export default ExpensesList; 