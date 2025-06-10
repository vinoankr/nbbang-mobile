import { storage } from '@/src/utils/storage';
import { useRouter } from 'expo-router';
import React from 'react'
import { View, Text, Button } from 'react-native'

export default function Auth() {
  const router = useRouter();
  
  return (
    <View>
      <Text>Auth</Text>
      <Button title="Login" onPress={() => {
        storage.set('token', '1234567890');
        router.replace('/groups');
      }} />
    </View>
  )
}
