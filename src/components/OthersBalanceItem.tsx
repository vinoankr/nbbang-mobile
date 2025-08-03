import React, { useRef, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MediumText, SemiBoldText } from './Texts';
import { useModal } from '../hooks/useModal';
import { ParticipantWithAmount, useAddExpense } from '../hooks/mutations/useAddExpense';
import TransferConfirmModal from './modals/TransferConfirmModal';
import { CurrencyCode } from '../constants/currencies';
import { formatCurrency } from '../utils/formatter';
import Toast from 'react-native-toast-message';
import { ChevronLeft } from 'lucide-react-native';
import { useNetInfo } from '@react-native-community/netinfo';

interface Member {
  id: string;
  user_name: string;
  user_id: string | null;
}

interface OthersBalanceItemProps {
  groupId: string;
  myMemberId: string;
  memberNameMap: Map<string, string>;
  to: string;
  from: string;
  amount: number;
  currency: CurrencyCode;
}

const   OthersBalanceItem: React.FC<OthersBalanceItemProps> = ({ 
  groupId,
  memberNameMap,
  to,
  from,
  amount,
  currency,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const { showModal, closeModal } = useModal();
  const { mutateAsync: addExpense } = useAddExpense();
  const { isInternetReachable } = useNetInfo();
  const toName = memberNameMap.get(to);
  const fromName = memberNameMap.get(from);

  const handleConfirmTransfer = async () => {
    if (!groupId || isSubmittingRef.current) return;

    if (!isInternetReachable) {
      Toast.show({
        type: 'error',
        text1: '네트워크 연결이 필요해요',
      });
      return;
    }
    
    try {
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      
      // 송금 정보 등록
      const receiverSet: ParticipantWithAmount[] = [{
        id: to,
        amount: Math.abs(amount),
        amountInCurrency:Math.abs(amount)
      }];
      
      await addExpense({
        groupId,
        title: '개인송금',
        amount: Math.abs(amount),
        amountInCurrency:Math.abs(amount),
        spentAt: new Date(new Date().toISOString().split('T')[0]),
        currency,
        exchangeRate: 1,
        paidBy: from,
        participants: receiverSet,
        isTransfer: true,
        transferTo: to,
      });
      
      // 모달 닫기
      closeModal();
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

  const openTransferModal = () => {
    showModal(
      <TransferConfirmModal 
        toName={toName}
        fromName={fromName} 
        channel={null}
        isToMe={null}
        onConfirm={handleConfirmTransfer}
        closeModal={closeModal}
        isSubmitting={isSubmitting}
      />
    );
  };

  return (
    <View className="flex flex-row items-center justify-between pt-2">
      <View className="flex flex-col gap-0.5">
        <View className="flex flex-row items-center gap-1">
          <MediumText className="text-gray-800 text-base font-semibold">{fromName || "홍길동"}</MediumText>
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <ChevronLeft size={16} strokeWidth={2.5} />
          </View>
          <MediumText className="text-gray-800 text-base font-semibold">{toName || "이순신"}</MediumText>
        </View>
        <MediumText className="text-base text-gray-800">{formatCurrency(Math.abs(amount), currency)}</MediumText>
      </View>
      <View className="flex flex-row items-center gap-2">
        <TouchableOpacity 
          className="flex items-center justify-center px-3 py-2 rounded-lg bg-gray-50 border border-gray-100"
          onPress={(e) => {
            openTransferModal();
          }}
        >
          <SemiBoldText className="text-gray-800 text-base">완료처리</SemiBoldText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OthersBalanceItem; 