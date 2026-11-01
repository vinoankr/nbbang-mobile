import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { BoldText, MediumText, SemiBoldText } from './Texts';
import ChevronUp from '../../assets/icons/chevron-up.svg';
import ChevronDown from '../../assets/icons/chevron-down.svg';
import { CurrencyCode } from '../constants/currencies';
import { formatCurrency } from '../utils/formatter';
import { SettlementSummary as SettlementSummaryData } from '../utils/settlementCalculator';

interface SettlementSummaryProps {
  summary: SettlementSummaryData;
  currency: CurrencyCode;
}

const SettlementSummary = ({ summary, currency }: SettlementSummaryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const rows = [
    { label: '내가 낸 금액(+)', amount: summary.paid, color: 'text-blue-500' },
    { label: '내가 쓴 금액(-)', amount: summary.spent, color: 'text-red-500' },
    { label: '보낸 금액(+)', amount: summary.sent, color: 'text-blue-500' },
    { label: '받은 금액(-)', amount: summary.received, color: 'text-red-500' },
  ];
  const balance = Math.abs(summary.balance) > 0.01 ? summary.balance : 0;
  const totalLabel = balance > 0 ? '총 받을 금액' : balance < 0 ? '총 보낼 금액' : '남은 정산 금액';
  const totalColor = balance > 0 ? 'text-blue-500' : balance < 0 ? 'text-red-500' : 'text-gray-800';

  return (
    <View className="rounded-lg border border-gray-100 bg-white">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="왜 이런 정산 결과가 나왔나요?"
        accessibilityState={{ expanded: isOpen }}
        className="flex-row items-center justify-between gap-3 px-4 py-3.5"
        onPress={() => setIsOpen(open => !open)}
      >
        <BoldText className="flex-1 text-base text-gray-800">왜 이런 정산 결과가 나왔나요?</BoldText>
        {isOpen ? <ChevronUp width={20} height={20} /> : <ChevronDown width={20} height={20} />}
      </Pressable>
      {isOpen && (
        <View className="gap-3 px-4 pb-4 pt-1">
          {rows.map(row => (
            <View key={row.label} className="flex-row items-center justify-between gap-3">
              <MediumText className="text-sm text-gray-600">{row.label}</MediumText>
              <SemiBoldText className={`text-sm ${row.color}`}>
                {formatCurrency(row.amount, currency)}
              </SemiBoldText>
            </View>
          ))}
          <View className="mt-1 flex-row flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4">
            <BoldText className="text-lg text-gray-900">{totalLabel}</BoldText>
            <BoldText className={`text-lg ${totalColor}`}>
              {formatCurrency(Math.abs(balance), currency)}
            </BoldText>
          </View>
        </View>
      )}
    </View>
  );
};

export default SettlementSummary;
