import { Stack } from "expo-router";

export default function GroupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add-expense" options={{ presentation: 'modal' }} />
      <Stack.Screen name="edit-expense" options={{ presentation: 'modal' }} />
    </Stack>
  );
} 