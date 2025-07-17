import React from 'react';
import { View } from 'react-native';
import { FormLabel } from '../form/FormLabel';
import { InputField } from '../form/InputField';
import { PrimaryButton } from '../form/PrimaryButton';

interface VerifyFormProps {
  phoneNumber: string;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

export const VerifyForm: React.FC<VerifyFormProps> = ({
  phoneNumber,
  verificationCode,
  setVerificationCode,
  isLoading,
  onSubmit,
}) => {
  return (
    <View className="w-full flex-col gap-4">
      <View className="w-full">
        <FormLabel label="인증번호" />
        <InputField
          value={verificationCode}
          onChangeText={(text) => setVerificationCode(text.replace(/[^0-9]/g, ''))}
          placeholder="인증번호를 입력해주세요"
          keyboardType="number-pad"
          inputMode='numeric'
          maxLength={6}
          autoComplete="one-time-code"
          autoFocus
        />
      </View>
      <PrimaryButton
        title={isLoading ? '처리중...' : '인증하기'}
        onPress={onSubmit}
        disabled={isLoading || verificationCode.length !== 6}
        loading={isLoading}
      />
    </View>
  );
}; 