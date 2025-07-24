import { Stack } from "expo-router";

export default function GroupsLayout() {

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false, animation: 'none' }} />
      <Stack.Screen name="create" options={{ headerShown: false }} />
    </Stack>
  );
}