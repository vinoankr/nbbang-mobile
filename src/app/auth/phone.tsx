import React, { useEffect } from 'react';
import { View, TouchableOpacity, Image, Alert } from 'react-native';
import { KeyboardAwareScrollView } from "@/src/components/Keyboard";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePhoneAuth } from '@/src/hooks/usePhoneAuth';
import { PhoneForm, VerifyForm, ProfileForm } from '@/src/components/auth';
import ScreenLayout from '@/src/components/ScreenLayout';

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
    <ScreenLayout variant="form">
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
      <View className="bg-white flex-1 pb-6">
        <View className="flex-row justify-between items-end pt-8 pb-8">
          <TouchableOpacity onPress={() => router.dismissTo('/')}>
            <Image 
              source={require('../../../assets/images/logo.webp')} 
              style={{ width: 208, height: 40 }} className="mb-4"
            />
          </TouchableOpacity>
        </View>
        {renderForm()}
      </View>
    </KeyboardAwareScrollView>
    </ScreenLayout>
  );
}
