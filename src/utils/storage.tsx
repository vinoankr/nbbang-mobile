import { MMKV } from 'react-native-mmkv'

const storage = new MMKV()

export const mmkvStorage = {
  setItem: (key: string, value: string) => storage.set(key, value),
  getItem: (key: string) => storage.getString(key) ?? null,
  removeItem: (key: string) => storage.delete(key),
};