import { createMMKV } from 'react-native-mmkv'

// Keep the v3 default ID so existing credentials, caches and queued writes survive.
const storage = createMMKV({ id: 'mmkv.default' })

export const mmkvStorage = {
  setItem: (key: string, value: string) => storage.set(key, value),
  getItem: (key: string) => storage.getString(key) ?? null,
  removeItem: (key: string) => { storage.remove(key); },
};
