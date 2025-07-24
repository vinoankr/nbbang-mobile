import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { BoldText, MediumText } from '../Texts';
import { useModal } from '../../hooks/useModal';
import PersonIcon from '../../../assets/icons/person.svg';
import { Landmark } from 'lucide-react-native';

interface RegisterBankModalProps {
  handleOpenTransferConfirmModal: (channel: string | null) => void;
}

const RegisterBankModal: React.FC<RegisterBankModalProps> = ({
  handleOpenTransferConfirmModal,
}) => {
  const { closeModal } = useModal();

  const handleAccountRegister = () => {
    closeModal();
    // TODO: profile 페이지 구현 후 네비게이션 추가
    // router.push('/profile');
  };

  const handleKakaopayRegister = () => {
    closeModal();
    // TODO: link-kakaopay 페이지 구현 후 네비게이션 추가
    // router.push('/profile/link-kakaopay');
  };

  const handleAlreadyReceived = () => {
    closeModal();
    handleOpenTransferConfirmModal(null);
  };

  return (
    <View className="w-full flex flex-col">
      <BoldText className="text-[23px] mb-4 text-gray-800">송금받기</BoldText>
      <MediumText className="text-gray-600 text-base mb-4 leading-5">
        손쉬운 정산을 위해{'\n'}
        송금 받을 방법을 등록해주세요
      </MediumText>
      
      <View className="w-full flex flex-col gap-2 mb-3">
        <TouchableOpacity 
          className="w-full py-3.5 bg-gray-200 rounded-xl flex items-center justify-center gap-1.5 flex-row"
          onPress={handleAccountRegister}
        >
          <Landmark width={16} height={16} color="#30333D" />
          <BoldText className="text-lg text-gray-800">계좌번호 등록</BoldText>
        </TouchableOpacity>
        <TouchableOpacity 
          className="w-full py-3.5 bg-[#FEE500] rounded-xl flex items-center justify-center gap-1.5 flex-row"
          onPress={handleKakaopayRegister}
        >
          <Image source={require('../../../assets/images/kakao.webp')} resizeMode="contain" className="w-4 h-4" />
          <BoldText className="text-lg text-[#333333]">카카오페이 등록</BoldText>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity onPress={handleAlreadyReceived} activeOpacity={0.9} className='self-center border-b border-gray-800 pb-0.25 mt-2'>
        <MediumText className="text-gray-800 text-center text-base">
          이미 송금을 받았나요?
        </MediumText>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterBankModal; 