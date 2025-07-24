import React from 'react';
import { View } from 'react-native';
import { BoldText, MediumText } from '../Texts';
import { SecondaryButton } from '../form/SecondaryButton';

interface TransferConfirmModalProps {
  toName: string | undefined;
  fromName: string | undefined;
  channel: string | null;
  isToMe: boolean | null;
  onConfirm: () => Promise<void>;
  closeModal: () => void;
  isSubmitting: boolean;
}

const TransferConfirmModal: React.FC<TransferConfirmModalProps> = ({
  toName, 
  fromName, 
  channel,
  isToMe, 
  onConfirm, 
  isSubmitting,
}) => {
  const defaultToName = toName || '홍길동';
  const defaultFromName = fromName || '을지문덕';

  // 버튼 텍스트 생성 함수
  const getButtonText = () => {
    if (isSubmitting) {
      return '처리 중...';
    }
    
    if (isToMe === false) {
      return '송금 완료했어요';
    }
    
    return '정산 완료했어요';
  };

  return (
    <View>
      <BoldText className="text-[23px] mb-4 text-gray-800">정산 완료하기</BoldText>
      <View className="mb-4">
        <MediumText className="text-gray-600 text-base">
          {(() => {
            switch (isToMe) {
              case true:
                return `${defaultFromName}님으로부터 정산금을 받았나요?`;
              case false:
                return `${defaultToName}님께 ${channel ? `${channel} 송금` : '송금'}을 완료했나요?`;
              case null:
                return '두 멤버 사이의 정산이 완료되었나요?'
            }
          })()}
        </MediumText>
        <MediumText className="text-gray-600 text-base mt-1">
          아래 버튼을 누르면 송금기록이 등록돼요!
        </MediumText>
      </View>
      
      <View className="w-full flex justify-center items-center">
        <SecondaryButton 
          title={getButtonText()}
          onPress={onConfirm}
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </View>
    </View>
  );
};

export default TransferConfirmModal; 