import { useRouter, useSegments } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { Alert } from 'react-native';

export default function LinkHandler() {
  const router = useRouter();

  // TODO
  // groupDetail 의 경우에 파싱해서 넘기기.
  // 나머지 경우는 / 로 보내기

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) {
        const { path, queryParams } = Linking.parse(url);
        Alert.alert(url);
        Alert.alert(path || '');
        Alert.alert(JSON.stringify(queryParams));
        if (path) {
          router.replace(`/${path}` as any);
        }
      }
    });

    const sub = Linking.addEventListener('url', ({ url }) => {
      const { path } = Linking.parse(url);
        Alert.alert(url);
      Alert.alert(path || '');
      if (path) {
        router.replace(`/${path}` as any);
      }
    });

    return () => sub.remove();
  }, [router]);

  return null;
} 