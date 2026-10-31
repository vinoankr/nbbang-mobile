import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { BoldText, MediumText } from '../Texts';
import { CurrencyCode } from '../../constants/currencies';
import { formatCurrency } from '../../utils/formatter';
import { useGroupMemberAccountInfo } from '../../hooks/queries/useGroupMemberAccountInfo';
import { Landmark } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useParsedCurrencyRates } from '../../hooks/useParsedCurrencyRates';

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
  const {currencyMap, isLoading, latestUpdatedAt} = useParsedCurrencyRates();

  const KRWAmount = (currencyMap.get(currency) || 0) * amount;
  const KRWAmountString = formatCurrency(KRWAmount, "KRW").replace('₩','')+'원';
  const lastUpdatedAtString = new Date(latestUpdatedAt).toLocaleDateString('ko-KR', {month: '2-digit', day: '2-digit'}).replace(/\. /g, '/').replace('.', '');


  const onKakaoClick = async () => {
    if (!memberAccountInfo?.kakaopay_id) {
      Toast.show({
        type: 'error',
        text1: '카카오페이 정보를 찾을 수 없습니다',
      });
      return;
    }

    const kakaoUrl = `https://qr.kakaopay.com/${memberAccountInfo.kakaopay_id}${((KRWAmount * 524288).toString(16))}`;
    
    try {
      await Linking.openURL(kakaoUrl);
    } catch (error) {
      console.log(error)
      Toast.show({
        type: 'error',
        text1: '카카오페이 앱을 열 수 없습니다',
      });
    }
  }

  const onTossClick = async () => {
    
    const tossUrl = `supertoss://send?amount=${KRWAmount}&bank=${encodeURIComponent(memberAccountInfo?.bank || '')}&accountNo=${memberAccountInfo?.account_number}`;
    
    try {
      const canOpen = await Linking.canOpenURL(tossUrl);
      if (canOpen) {
        await Linking.openURL(tossUrl);
        // 앱이 성공적으로 열렸다면 잠시 후 확인 모달 열기
        setTimeout(() => {
          openConfirmModal('토스');
        }, 1000);
      } else {
        Toast.show({
          type: 'error',
          text1: '토스 앱이 설치되어 있지 않습니다',
          text2: '앱스토어에서 토스를 설치해주세요',
        });
      }
    } catch (error) {
      console.log(error)
      Toast.show({
        type: 'error',
        text1: '토스 앱을 열 수 없습니다',
      });
    }
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

  const cannotTransfer = !memberAccountInfo?.kakaopay_id && !memberAccountInfo?.account_number;

  return (
    <View>
      <BoldText className="text-[23px] mb-4 text-gray-800">송금하기</BoldText>
      <BoldText className="text-xl text-gray-800 mb-2 tracking-tight">
        {toName}에게 {formatCurrency(amount, currency)} 보내기
      </BoldText>
      <MediumText className="text-gray-500 text-base mb-6 leading-5">
        { (!isMemberAccountInfoLoading && cannotTransfer) ? '상대방이 수령계좌를 등록하지 않았어요.' : '송금 완료후, 정산완료 버튼을 눌러주세요!'}
      </MediumText>
      {
        currency !== 'KRW' && (
          <MediumText className="text-gray-500 text-base mb-6 leading-5">
            {
              isLoading ? '송금 환율 계산중...' : `(${KRWAmountString}, ${lastUpdatedAtString}기준)`
            }
          </MediumText>
        )
      }
      
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
            <Image source={require('../../../assets/images/kakao.webp')} resizeMode="contain" style={{ width: 16, height: 16 }} />
            <BoldText className="text-lg text-[#333333]">카카오 송금</BoldText>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`w-full py-3.5 bg-[#202632] rounded-xl flex items-center justify-center gap-2 flex-row ${memberAccountInfo?.account_number || isMemberAccountInfoLoading ? 'opacity-100' : 'opacity-50'}`}
            onPress={onTossClick}
            disabled={isMemberAccountInfoLoading || !memberAccountInfo?.account_number}
          >
            <Image source={require('../../../assets/images/toss.webp')} resizeMode="contain" style={{ width: 16, height: 16 }} />
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
              송금이 벌써 완료됐나요?
            </MediumText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default TransferModal; 