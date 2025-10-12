import { useState, useEffect } from "react";
import { View, TouchableOpacity, ScrollView, Image, Platform, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { useProfile } from "../../hooks/queries/useMe";
import { useUpdateProfile } from "../../hooks/mutations/useUpdateProfile";
import Header from "../../components/Header";
import Toast from "react-native-toast-message";
import { MediumText, BoldText } from "../../components/Texts";
import { PrimaryButton } from "../../components/form/PrimaryButton";
import { SecondaryButton } from "../../components/form/SecondaryButton";
import { FormLabel } from "../../components/form/FormLabel";
import { InputField } from "../../components/form/InputField";
import { FormInfo } from "../../components/form/FormInfo";
import Spinner from "../../components/Spinner";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

// 이미지 import
const step1Image = require('../../../assets/images/step-1.webp');
const step2Image = require('../../../assets/images/step-2.webp');
const step3Image = require('../../../assets/images/step-3.webp');

const LinkKakaopayPage = () => {
  const { data: user, isLoading } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const [currentStep, setCurrentStep] = useState(0);
  const [kakaopayId, setKakaopayId] = useState("");
  const [isError, setIsError] = useState(false);
  const [initialValue, setInitialValue] = useState('');
  const [isInfo, setIsInfo] = useState(false);

  const insets = useSafeAreaInsets();

  // 사용자 정보가 로드되면 기본값 설정
  useEffect(() => {
    if (user?.kakaopay_id) {
      setKakaopayId(user.kakaopay_id);
      setInitialValue(user.kakaopay_id);
    }
  }, [user]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!kakaopayId.trim() || isError) {
      Toast.show({
        type: 'error',
        text1: '올바른 송금 ID를 입력해주세요',
      });
      return;
    }

    updateProfile(
      { kakaopay_id: kakaopayId.trim() },
      {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: '카카오페이 연동이 완료되었습니다!',
          });
          router.back();
        },
      }
    );
  };

  const handlePaste = (text: string) => {
    const parsedText = text.split('/').pop() || '';
    if (/^[A-Z][a-zA-Z0-9]{8}$/.test(parsedText)) {
      setKakaopayId(parsedText);
      setIsError(false);
    } else {
      setIsError(true);
    }
  };

  const renderTutorialStep = (currentStep: number) => {
    switch (currentStep) {
      case 0:
        return (
          <View className="w-full mb-8">
            <FormLabel label="송금코드" />
            <InputField
              value={kakaopayId}
              placeholder="복사한 코드 그대로 붙여넣기"
              onChangeText={(text) => {
                handlePaste(text);
              }}
              editable={!isPending}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <FormInfo 
              message={isError ? "정확한 송금코드를 붙혀넣어주세요!" : undefined}
              isError={isError}
            />

            <View className="mt-4 items-center">
              <TouchableOpacity
                onPress={() => setIsInfo((prev) => !prev)}
              >
                <MediumText className="text-gray-500 underline text-base">
                  송금코드를 등록하면 뭐가 좋나요?
                </MediumText>
              </TouchableOpacity>
              {isInfo && (
                <MediumText className="text-gray-800 text-center mt-4 text-base leading-6">
                  카카오페이 코드를 등록하면,{'\n'}
                  정산금을 카카오페이로 받을 수 있어요!
                </MediumText>
              )}
            </View>
            
            <View className="mt-4 items-center">
              <TouchableOpacity
                onPress={() => setCurrentStep(1)}
              >
                <MediumText className="text-gray-500 underline text-base">
                  송금코드를 어떻게 확인하나요?
                </MediumText>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 1:
        return (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="flex-1 items-center px-4">
              <View className="w-full max-w-md mb-6">
                <BoldText className="text-xl text-gray-800 text-center leading-7">
                  카카오톡 더보기 상단의{'\n'}
                  QR코드 아이콘을 눌러주세요
                </BoldText>
              </View>
              <View className="bg-gray-50 rounded-xl p-6 mb-4 w-full">
                <Image 
                  source={step1Image} 
                  className="w-full h-80"
                  resizeMode="contain"
                />
              </View>
            </View>
          </ScrollView>
        );

      case 2:
        return (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="flex-1 items-center px-4">
              <View className="w-full max-w-md mb-6">
                <BoldText className="text-xl text-gray-800 text-center leading-7">
                  하단 세 개 버튼 중{'\n'}
                  송금코드 버튼을 눌러주세요
                </BoldText>
              </View>
              <View className="bg-gray-50 rounded-xl p-6 mb-4 w-full">
                <Image 
                  source={step2Image} 
                  className="w-full h-80"
                  resizeMode="contain"
                />
              </View>
            </View>
          </ScrollView>
        );

      case 3:
        return (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="flex-1 items-center px-4">
              <View className="w-full max-w-md mb-6">
                <BoldText className="text-xl text-gray-800 text-center leading-7">
                  QR코드 바로 아래{'\n'}
                  링크복사 버튼을 눌러주세요!
                </BoldText>
              </View>
              <View className="bg-gray-50 rounded-xl p-6 mb-4 w-full">
                <Image 
                  source={step3Image} 
                  className="w-full h-80"
                  resizeMode="contain"
                />
              </View>
            </View>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setCurrentStep(1);
    }, 50);
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <Header 
          title="카카오페이 연동" 
          showBackButton={true} 
          onBackClick={() => router.back()} 
        />
        <View className="flex-1 justify-center items-center">
          <Spinner />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" style={{
      paddingTop: insets.top,
    }}>
      <Header 
        title="카카오페이 연동" 
        showBackButton={true} 
        onBackClick={() => router.back()} 
      />
      <KeyboardAwareScrollView
        bottomOffset={50}
        style={{ flex: 1, backgroundColor: 'white' }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: Platform.OS === "ios" ? 0 : insets.bottom }}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        alwaysBounceVertical={false}
      >
        <View className="px-4 pt-20">
          {renderTutorialStep(currentStep)}
        </View>
  
        <View className="px-4 pb-4 pt-4 flex-row gap-2">
          {[1, 2, 3].includes(currentStep) && (
            <SecondaryButton
              title="이전"
              onPress={handlePrevious}
              disabled={isPending}
              className="flex-1"
            />
          )}
          <PrimaryButton
            title={
              isPending 
                ? '처리 중...'
                : currentStep === 0 
                  ? (initialValue ? "수정하기" : "등록하기")
                  : currentStep === 3 
                    ? "등록하러가기"
                    : "다음"
            }
            onPress={currentStep === 0 ? handleSubmit : handleNext}
            disabled={
              isPending || 
              (currentStep === 0 && initialValue && kakaopayId.trim() === initialValue) || 
              (currentStep === 0 && (!kakaopayId.trim() || isError))
            }
            className="flex-1"
            loading={isPending}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default LinkKakaopayPage;
