import { Stack } from "expo-router";
import "../../global.css";
import { SafeAreaView } from "react-native";

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, persister } from '../utils/queryClient';
import { NetworkProvider } from '../contexts/NetworkContext';

export default function RootLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <NetworkProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
        </SafeAreaView>
      </NetworkProvider>
    </PersistQueryClientProvider>
  )
}
