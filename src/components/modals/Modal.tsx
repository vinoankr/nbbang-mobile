import React, { useEffect } from 'react';
import { View, Pressable, Modal as RNModal, TouchableOpacity, Platform, BackHandler, StatusBar } from 'react-native';
import { useModal } from '../../hooks/useModal';
import X from '../../../assets/icons/x.svg';

export default function Modal() {
  const { component, isOpen, closeModal, canClose } = useModal();

  // 안드로이드 뒤로가기 버튼 처리
  useEffect(() => {
    const handleBackPress = () => {
      if (isOpen) {
        closeModal();
        return true; // 이벤트 처리 완료
      }
      return false;
    };

    if (isOpen && Platform.OS === 'android') {
      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      
      return () => {
        subscription.remove();
      };
    }
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  return (
    // <RNModal
    //   transparent
    //   visible={isOpen}
    //   statusBarTranslucent={true}
    //   onRequestClose={() => {
    //     if (canClose) {
    //       closeModal();
    //     }
    //   }}
    // >
    //   <View className="flex-1 items-center justify-center">
    //     <Pressable 
    //       className="absolute inset-0 bg-black opacity-70"
    //       style={{
    //         top: Platform.OS === 'android' ? -(StatusBar.currentHeight || 0) : 0,
    //         height: Platform.OS === 'android' ? `100%` : undefined,
    //       }}
    //       onPress={() => {
    //         if (canClose) {
    //           closeModal();
    //         }
    //       }}
    //     />

        <View
          className="absolute inset-0 z-5 items-center justify-center"
          style={{
            backgroundColor: 'rgba(0,0,0,0.7)',
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
          }}
          >
            <Pressable
              className="absolute inset-0"
          onPress={() => {
            if (canClose) {
              closeModal();
            }
          }}
            />
        
        <View className="w-full max-w-md px-5">
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
      </View>
    //   </View>
    // </RNModal>
  );
}
