import React, { useEffect } from 'react';
import { View, Pressable, TouchableOpacity, Platform, BackHandler, ScrollView, StyleSheet } from 'react-native';
import { useModal } from '../../hooks/useModal';
import X from '../../../assets/icons/x.svg';
import { KeyboardAvoidingView } from '@/src/components/Keyboard';
import ScreenLayout from '../ScreenLayout';

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
    <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityLabel="모달 배경"
          onPress={() => {
            if (canClose) {
              closeModal();
            }
          }}
        />
        <ScreenLayout variant="full" backgroundColor="transparent">
          <KeyboardAvoidingView behavior="padding" style={styles.keyboard} pointerEvents="box-none">
          <View testID="modal-card" accessibilityViewIsModal style={styles.card}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.body}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              showsVerticalScrollIndicator
            >
              {component}
            </ScrollView>
            {canClose && (
              <TouchableOpacity 
                onPress={closeModal}
                style={styles.close}
                accessibilityRole="button"
                accessibilityLabel="닫기"
                activeOpacity={0.7}
              >
                <X className='w-6 h-6' />
              </TouchableOpacity>
            )}
          </View>
          </KeyboardAvoidingView>
        </ScreenLayout>
      </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.7)' },
  keyboard: { flex: 1, minHeight: 0, justifyContent: 'center', alignItems: 'center', padding: 16 },
  card: { width: '100%', maxWidth: 448, maxHeight: '100%', flexShrink: 1, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  scroll: { flexShrink: 1 },
  body: { padding: 20, paddingTop: 28 },
  close: { position: 'absolute', top: 4, right: 4, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 22 },
});
