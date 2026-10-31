import { SplashScreen, Stack } from "expo-router";
import "../../global.css";
import { useFonts } from 'expo-font';

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, persister } from '../utils/queryClient';
import { NetworkProvider } from '../contexts/NetworkContext';
import { useEffect, useCallback } from "react";
import Toast from "react-native-toast-message";
import Modal from '../components/modals/Modal';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { toastConfig } from '../utils/toastConfig';
import { initializeKakaoSDK } from '@react-native-kakao/core';
import * as Sentry from '@sentry/react-native';
import { KeyboardProvider } from '@/src/components/Keyboard';
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  initializeKakaoSDK('93959bb8c9aa19c9ae9ad2ca73ffb3c5');
}
// 스플래시 스크린 자동 숨김 방지
SplashScreen.preventAutoHideAsync(); 

if (Platform.OS !== 'web') Sentry.init({
  dsn: 'https://395ddb85ebce2db174caa415354c130c@o4509882054410240.ingest.us.sentry.io/4509882436026368',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
});

function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Pretendard-500': require('../../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-600': require('../../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-700': require('../../assets/fonts/Pretendard-Bold.otf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.warn('스플래시 스크린 숨김 중 오류:', error);
      }
    }
  }, [fontsLoaded]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <NetworkProvider>
        <SafeAreaProvider>
          <KeyboardProvider>  
            <Stack screenOptions={{ headerShown: false, animation: 'none' }}/>
            <Modal />
            <Toast config={toastConfig} />
          </KeyboardProvider>
        </SafeAreaProvider>
      </NetworkProvider>
    </PersistQueryClientProvider>
  )
}

export default Platform.OS === 'web' ? RootLayout : Sentry.wrap(RootLayout);
