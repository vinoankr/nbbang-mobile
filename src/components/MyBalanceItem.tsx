import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Share } from 'react-native';
import { BoldText, MediumText } from './Texts';
import { ParticipantWithAmount, useAddExpense } from '../hooks/mutations/useAddExpense';
import { useModal } from '../hooks/useModal';
import { CurrencyCode } from '../constants/currencies';
import { formatCurrency } from '../utils/formatter';
import TransferConfirmModal from './modals/TransferConfirmModal';
import TransferModal from './modals/TransferModal';
import RegisterBankModal from './modals/RegisterBankModal';
import Toast from 'react-native-toast-message';
import { useProfile } from '../hooks/queries/useMe';
import { Banknote, HandCoins, UserPlus2 } from 'lucide-react-native';
import { josa } from 'es-hangul';
import { useNetInfo } from '@react-native-community/netinfo';

interface Member {
  id: string;
  user_name: string;
  user_id: string | null;
}

interface MyBalanceItemProps {
  groupId: string;
  members: Member[];
  myMemberId: string;
  memberNameMap: Map<string, string>;
  to: string;
  from: string;
  amount: number;
  currency: CurrencyCode;
  openInviteModal: () => void;
}

const MyBalanceItem: React.FC<MyBalanceItemProps> = ({ 
  groupId,
  members,
  myMemberId,
  memberNameMap,
  to,
  from,
  amount,
  currency,
  openInviteModal,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const { mutateAsync: addExpense } = useAddExpense();
  const { showModal, closeModal } = useModal();
  const { data: userProfile } = useProfile();
  const { isInternetReachable } = useNetInfo();
  const isToMe = to === myMemberId;
  const shouldInvite = isToMe ? !members.find(member => member.id === from)?.user_id : !members.find(member => member.id === to)?.user_id;
  const shouldRegisterBank = isToMe && !userProfile?.kakaopay_id && !userProfile?.bank;

  const toName = memberNameMap.get(to);
  const fromName = memberNameMap.get(from);

  const getColor = () => {
    if (isToMe) return 'text-blue-500'
    return 'text-red-500';
  };

  const getText = () => {
    if (shouldRegisterBank) return '송금받기';
    if (shouldInvite) return '초대하기';
    if (isToMe) return '재촉하기';
    return '송금하기';
  }

  const getIcon = () => {
    if (shouldRegisterBank) return <HandCoins width={18} height={18} color={'#2C7FFF'} strokeWidth={2.5} />;
    if (shouldInvite) return <UserPlus2 width={18} height={18} color={isToMe ? '#2C7FFF' : '#FF4665'} strokeWidth={2.5} />;
    if (isToMe) return <HandCoins width={18} height={18} color={'#2C7FFF'} strokeWidth={2.5} />;
    return <Banknote width={18} height={18} color={'#FF4665'} strokeWidth={2.5} />;
  }

  const handleConfirmTransfer = async () => {
    if (!groupId || isSubmittingRef.current) return;

    if (!isInternetReachable) {
      Toast.show({
        type: 'error',
        text1: '네트워크 연결이 필요해요',
      });
      return;
    }

    isSubmittingRef.current = true;
    try {
      setIsSubmitting(true);
      
      // 송금 기록 생성
      // to가 내 ID라면 다른 사람이 나에게 보낸 것이므로, paidBy는 from이 되고 receiver는 to(나)가 됨
      // from이 내 ID라면 내가 다른 사람에게 보낸 것이므로, paidBy는 from(나)가 되고 receiver는 to가 됨
      const paidBy = to === myMemberId ? from : from === myMemberId ? from : '';
      const receiverId = to === myMemberId ? to : from === myMemberId ? to : '';
      
      if (!paidBy || !receiverId) {
        console.error('송금 정보 오류');
        return;
      }

      // 송금 정보 등록
      const receiverSet: ParticipantWithAmount[] = [{
        id: receiverId,
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
        paidBy,
        participants: receiverSet,
        isTransfer: true,
        transferTo: receiverId,
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
      <TransferModal 
        toId={to}
        toName={toName}
        amount={amount}
        currency={currency}
        openConfirmModal={openTransferConfirmModal}
      />
    );
  };  

  const openTransferConfirmModal = (channel: string | null) => {
    showModal(
      <TransferConfirmModal 
        toName={toName}
        fromName={fromName}
        channel={channel}
        isToMe={to === myMemberId}
        onConfirm={handleConfirmTransfer}
        closeModal={closeModal}
        isSubmitting={isSubmitting}
      />
    );
  };

  const openRegisterBankModal = () => {
    showModal(
      <RegisterBankModal handleOpenTransferConfirmModal={openTransferConfirmModal} />
    );
  };

  const handleHurryUp = async () => {
    const url = `https://nbbang.app/groups/${groupId}?activeTab=settlement`;
    try {
      await Share.share({
        url: url,
        title: '정산금을 보내주세요!',
        message: `${fromName}님, ${toName}님께 보내야 할 정산금이 있어요!`,
      });
    } catch (error) {
      console.error('공유 실패:', error);
      Toast.show({
        type: 'error',
        text1: '공유에 실패했어요.',
      });
    }
  }

  return (
    <View className="w-full bg-gray-50 border border-gray-100 rounded-lg p-4 flex flex-col items-center justify-center gap-3">
      <View className="self-start">
        <BoldText className="text-lg text-gray-800">
          {isToMe ? fromName : toName}{isToMe ? josa.pick(fromName || '()', '으로부터/로부터') : '에게'} <BoldText className={`${getColor()}`}>{formatCurrency(Math.abs(amount), currency)}</BoldText> {isToMe ? '받기' : '보내기'}
        </BoldText>
      </View>
      {shouldInvite && !shouldRegisterBank && (
        <View className="self-start -mt-1">
          <MediumText className="text-gray-500 text-base">아직 그룹에 들어오지 않았어요!</MediumText>
        </View>
      )}
      <View className='w-full flex-row gap-2'>
        {isToMe && <TouchableOpacity 
          className='flex-1 items-center justify-center gap-2 py-2.5 bg-white rounded-lg'
          onPress={() => openTransferConfirmModal(null)}
          activeOpacity={0.9}
        >
          <BoldText className='w-full text-center text-lg text-gray-700'>정산완료</BoldText>
        </TouchableOpacity>}
        <TouchableOpacity 
          className={`${isToMe ? 'flex-2' : 'flex-1'} items-center justify-center gap-2 py-2.5 bg-white rounded-lg`}
          onPress={shouldRegisterBank ? openRegisterBankModal : shouldInvite ? () => openInviteModal() : isToMe ? () => handleHurryUp() : openTransferModal}
          activeOpacity={0.9}
        >
          <View className="w-full flex-row items-center justify-center gap-1.5">
            {getIcon()}
            <BoldText className={`text-lg ${getColor()}`}>{getText()}</BoldText>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
};

export default MyBalanceItem; 