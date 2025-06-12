import { mmkvStorage } from '../../utils/storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react'
import { View, Text, Button, TextInput } from 'react-native'

export default function Auth() {
  const [token, setToken] = useState('');
  const router = useRouter();
  
  return (
    <View>
      <Text>Auth</Text>
      <TextInput
        placeholder="Token"
        value={token}
        onChangeText={setToken}
      />
      <Button title="Login" onPress={() => {
        mmkvStorage.setItem('authToken', token);
        router.replace('/groups');
      }} />
    </View>
  )
}
