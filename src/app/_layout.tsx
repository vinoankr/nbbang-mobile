import { SplashScreen, Stack } from "expo-router";
import "../../global.css";
import { useFonts } from 'expo-font';

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, persister } from '../utils/queryClient';
import { NetworkProvider } from '../contexts/NetworkContext';
import { useEffect, useCallback } from "react";
import Toast, { ErrorToast, InfoToast, SuccessToast, ToastProps } from "react-native-toast-message";
import { StyleSheet } from "react-native";


// 스플래시 스크린 자동 숨김 방지
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Pretendard-300': require('../../assets/fonts/Pretendard-Light.otf'),
    'Pretendard-400': require('../../assets/fonts/Pretendard-Regular.otf'),
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
        <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
        <Toast config={{
            success: (props: ToastProps) => (
              <SuccessToast
                {...props}
                style={toastStyle.successToast}
                contentContainerStyle={toastStyle.toastContent}
                text1Style={toastStyle.toastText1}
              />
            ),
            error: (props: ToastProps) => (
              <ErrorToast
                {...props}
                style={toastStyle.errorToast}
                contentContainerStyle={toastStyle.toastContent}
                text1Style={toastStyle.toastText1}
              />
            ),
            info: (props: ToastProps) => (
              <InfoToast
                {...props}
                style={toastStyle.infoToast}
                contentContainerStyle={toastStyle.toastContent}
                text1Style={toastStyle.toastText1}
              />
            ),
          }}
        />
      </NetworkProvider>
    </PersistQueryClientProvider>
  )
}

const toastStyle = StyleSheet.create({
  successToast: {
    backgroundColor: '#fff',
    borderLeftColor: '#06B20C',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 10,
    borderRadius: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorToast: {
    backgroundColor: '#fff',
    borderLeftColor: '#E34033',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 10,
    borderRadius: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoToast: {
    backgroundColor: '#fff',
    borderLeftColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 10,
    borderRadius: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastContent: {
    paddingHorizontal: 5,
  },
  toastText1: {
    fontSize: 16,
    fontWeight: '600',
    color: '#30333D',
  },
});