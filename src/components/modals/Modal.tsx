import React, { useEffect } from 'react';
import { View, Pressable, TouchableOpacity, Platform, BackHandler } from 'react-native';
import { useModal } from '../../hooks/useModal';
import X from '../../../assets/icons/x.svg';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

export default function Modal() {
  const { component, isOpen, closeModal, canClose } = useModal();
  // 안드로이드 뒤로가기 버튼 처리
  useEffect(() => {
    const handleBackPress = () => {
      if (isOpen && canClose) {
        closeModal();
      }
      return true;
    };

    if (isOpen && Platform.OS === 'android') {
      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => {
        subscription.remove();
      };
    }
  }, [isOpen, closeModal, canClose]);

  if (!isOpen) return null;

  return (
    <KeyboardAvoidingView
      behavior='padding'
      className="absolute inset-0 z-5 items-center justify-center"
      style={{
        backgroundColor: 'rgba(0,0,0,0.7)',
      }}
      >
        <Pressable
          className="absolute -inset-20"
          onPress={() => {
            if (canClose) {
              closeModal();
            }
          }}
        />
        <View className="w-full max-w-md px-5"  
        >
          <View className="w-full max-w-md bg-white p-5 rounded-xl relative">
            {canClose && (
              <TouchableOpacity 
                onPress={closeModal}
                className="absolute top-4 right-4 z-10 h-8 w-8 flex items-center justify-center"
                accessibilityLabel="닫기"
                activeOpacity={0.7}
              >
                <X className='w-6 h-6' />
              </TouchableOpacity>
            )}
            {component}
          </View>
        </View>
      </KeyboardAvoidingView>
  );
}
