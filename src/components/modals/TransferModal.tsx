import React, { useState } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { BoldText, MediumText } from '../Texts';
import { CurrencyCode } from '../../constants/currencies';
import { formatCurrency } from '../../utils/formatter';
import { useGroupMemberAccountInfo } from '../../hooks/queries/useGroupMemberAccountInfo';
import { Landmark } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

interface TransferModalProps {
  toId: string;
  toName: string | undefined;
  amount: number;
  currency: CurrencyCode;
  openConfirmModal: (channel: string) => void;
}

const TransferModal: React.FC<TransferModalProps> = ({
  toId,
  toName, 
  amount, 
  currency,
  openConfirmModal,
}) => {
  const { data: memberAccountInfo, isLoading: isMemberAccountInfoLoading } = useGroupMemberAccountInfo(toId);
  const [isShowCopiedMessage, setIsShowCopiedMessage] = useState(false);
  const onKakaoClick = () => {
    // const newWindow = window.open(`https://qr.kakaopay.com/${memberAccountInfo?.kakaopay_id}${((KRWAmount * 524288).toString(16))}`, '_blank');
    // setTimeout(()=>{
    //   newWindow.close();
    //   openConfirmModal('카카오')
    // },3000)
  }

  const onTossClick = () => {
    // hasAppSwitched.current = false;
    
    // setTimeout(() => {
    //   if (!hasAppSwitched.current) {
    //     toast.error('토스 앱을 열 수 없습니다');
    //   } else {
    //     openConfirmModal('토스')
    //   }
    // }, 3000);
    
    // window.location.href = `supertoss://send?amount=${KRWAmount}&bank=${encodeURIComponent(memberAccountInfo?.bank || '')}&accountNo=${memberAccountInfo?.account_number}`;
  }

  const onCopyClick = async () => {
    console.log(memberAccountInfo)
    const bank = memberAccountInfo?.bank;
    const accountNumber = memberAccountInfo?.account_number;
    if (!bank || !accountNumber) {
      Toast.show({
        type: 'error',
        text1: '계좌번호를 찾을 수 없습니다',
      });
      return;
    }

    await Clipboard.setStringAsync(`${bank} ${accountNumber}`);
    Toast.show({
      type: 'success',
      text1: '계좌번호가 클립보드에 복사되었습니다',
      text2: `${bank} ${accountNumber}`,
    });
    setIsShowCopiedMessage(true);
    setTimeout(() => {
      setIsShowCopiedMessage(false);
    }, 2000);
  };

  console.log(memberAccountInfo)

  return (
    <View>
      <BoldText className="text-[23px] mb-4 text-gray-800">송금하기</BoldText>
      <BoldText className="text-xl text-gray-800 mb-2 tracking-tight">
        {toName}에게 {formatCurrency(amount, currency)} 보내기
      </BoldText>
      <MediumText className="text-gray-500 text-base mb-6 leading-5">
        송금 완료후, 정산완료 버튼을 눌러주세요!
      </MediumText>
      
      {isMemberAccountInfoLoading ? (
        <View className="w-full flex flex-col justify-center items-center gap-2 my-8">
          <MediumText className="text-gray-500 text-base">로딩 중...</MediumText>
        </View>
      ) : (
        <View className="w-full flex flex-col justify-center items-center gap-2">
          <TouchableOpacity 
            className={`w-full py-3.5 bg-[#FEE500] rounded-xl flex items-center justify-center gap-2 flex-row ${memberAccountInfo?.kakaopay_id || isMemberAccountInfoLoading ? 'opacity-100' : 'opacity-50'}`}
            onPress={onKakaoClick}
            disabled={isMemberAccountInfoLoading || !memberAccountInfo?.kakaopay_id}
          >
            <Image source={require('../../../assets/images/kakao.webp')} resizeMode="contain" className="w-4 h-4" />
            <BoldText className="text-lg text-[#333333]">카카오 송금</BoldText>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`w-full py-3.5 bg-[#202632] rounded-xl flex items-center justify-center gap-2 flex-row ${memberAccountInfo?.account_number || isMemberAccountInfoLoading ? 'opacity-100' : 'opacity-50'}`}
            onPress={onTossClick}
            disabled={isMemberAccountInfoLoading || !memberAccountInfo?.account_number}
          >
            <Image source={require('../../../assets/images/toss.webp')} resizeMode="contain" className="w-4 h-4" />
            <BoldText className="text-lg text-white">토스 송금</BoldText>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`w-full py-3.5 bg-gray-200 rounded-xl flex items-center justify-center gap-2 flex-row ${memberAccountInfo?.account_number || isMemberAccountInfoLoading ? 'opacity-100' : 'opacity-50'}`}
            onPress={onCopyClick}
            disabled={isMemberAccountInfoLoading || !memberAccountInfo?.account_number}
          >
            <Landmark width={20} height={20} color="#30333D" />
            <BoldText className="text-lg text-gray-800">{isShowCopiedMessage ? '계좌번호 복사 완료!' : '직접 송금'}</BoldText>
          </TouchableOpacity>
          <TouchableOpacity className='self-center border-b border-gray-800 pb-0.25 mt-2' onPress={() => openConfirmModal('')}>
            <MediumText className="text-gray-800 text-base">
              송금이 완료됐나요?
            </MediumText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default TransferModal; 