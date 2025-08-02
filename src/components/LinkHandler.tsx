import { useRouter, useSegments } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect } from 'react';

export default function LinkHandler() {
  const router = useRouter();

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) {
        const { path, queryParams } = Linking.parse(url);
        console.log(url)
        console.log('path', path);
        console.log('queryParams', queryParams);
        if (path) {
          router.replace(`/${path}` as any);
        }
      }
    });

    const sub = Linking.addEventListener('url', ({ url }) => {
      const { path } = Linking.parse(url);
      console.log('url', url);
      console.log('path', path);
      if (path) {
        router.replace(`/${path}` as any);
      }
    });

    return () => sub.remove();
  }, [router]);

  return null;
} 