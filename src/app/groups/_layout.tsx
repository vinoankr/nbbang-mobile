import { mmkvStorage } from "../../utils/storage";
import { Redirect, Stack } from "expo-router";

export default function GroupsLayout() {
  const isAuthenticated = mmkvStorage.getItem('authToken');

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="create" options={{ headerShown: true, title: '새 그룹 만들기', presentation: 'modal' }} />
      <Stack.Screen name="[groupId]" options={{ headerShown: true, title: '' }} />
    </Stack>
  );
}