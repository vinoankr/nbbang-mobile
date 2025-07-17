import React, { useEffect } from 'react';
import { View, TouchableOpacity, Image, Alert, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { usePhoneAuth } from '@/src/hooks';
import { PhoneForm, VerifyForm, ProfileForm } from '@/src/components/auth';

export default function PhoneAuthPage() {
  const router = useRouter();
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
  } = usePhoneAuth();

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
    <KeyboardAvoidingView
      behavior='padding'
      style={{ flex: 1 }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
        overScrollMode="never"
      >
        <View className="bg-white px-4">
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
        </ScrollView>
    </KeyboardAvoidingView>
  );
}
