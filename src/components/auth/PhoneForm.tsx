import React from 'react';
import { View, Keyboard } from 'react-native';
import { formatPhoneNumber } from '@/src/utils/formatter';
import { FormLabel } from '../form/FormLabel';
import { InputField } from '../form/InputField';
import { PrimaryButton } from '../form/PrimaryButton';

interface PhoneFormProps {
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

export const PhoneForm: React.FC<PhoneFormProps> = ({
  phoneNumber,
  setPhoneNumber,
  isLoading,
  onSubmit,
}) => {
  const handlePhoneChange = (text: string) => {
    setPhoneNumber(formatPhoneNumber(text));
  };

  return (
    <View className="w-full flex-col gap-4">
      <View className="w-full">
        <FormLabel label="휴대전화 번호" />
        <InputField
          value={phoneNumber}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          inputMode='tel'
          autoComplete="tel"
          importantForAutofill="yes"
          maxLength={13}
          autoFocus
        />
      </View>
      <PrimaryButton
        title={isLoading ? '처리중...' : '인증번호 받기'}
        onPress={()=>{
          Keyboard.dismiss();
          onSubmit();
        }}
        disabled={isLoading || phoneNumber.length < 13}
        loading={isLoading}
      />
    </View>
  );
}; 