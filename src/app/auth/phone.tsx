import React, { useEffect } from 'react';
import { View, TouchableOpacity, Image, Alert } from 'react-native';
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePhoneAuth } from '@/src/hooks/usePhoneAuth';
import { PhoneForm, VerifyForm, ProfileForm } from '@/src/components/auth';

export default function PhoneAuthPage() {
  const router = useRouter();
  const { redirectGroupId } = useLocalSearchParams() as { redirectGroupId: string | null };
  const {
    step,
    phoneNumber,
    verificationCode,
    isLoading,
    error,
    setPhoneNumber,
    setVerificationCode,
    handleSendOtp,
    handleVerifyOtp,
    handleUpdateProfile,
  } = usePhoneAuth(
    redirectGroupId
  );

  // 현재 단계에 따른 폼 렌더링
  const renderForm = () => {
    switch (step) {
      case 'phone':
        return (
          <PhoneForm
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            isLoading={isLoading}
            onSubmit={handleSendOtp}
          />
        );
      case 'verify':
        return (
          <VerifyForm
            phoneNumber={phoneNumber}
            verificationCode={verificationCode}
            setVerificationCode={setVerificationCode}
            isLoading={isLoading}
            onSubmit={handleVerifyOtp}
          />
        );
      case 'name':
        return (
          <ProfileForm
            isEdit={false}
            isLoading={isLoading}
            updateUserProfile={handleUpdateProfile}
          />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (error) {
      Alert.alert('오류', error);
    }
  }, [error]);

  return (
    <KeyboardAwareScrollView
      bottomOffset={50}
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      overScrollMode="never"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bounces={false}
      alwaysBounceVertical={false}
    >
      <View className="bg-white flex-1 px-4">
        <View className="flex-row justify-between items-end pt-16 pb-8">
          <TouchableOpacity onPress={() => router.dismissTo('/')}>
            <Image 
              source={require('../../../assets/images/logo.webp')} 
              className="h-10 w-52 mt-12 mb-4"
            />
          </TouchableOpacity>
        </View>
        {renderForm()}
      </View>
    </KeyboardAwareScrollView>
  );
}
