import React from 'react'
import { View, Text, Button } from 'react-native'
import { useRouter } from 'expo-router';

export default function CreateGroup() {
  const router = useRouter();
  return (
    <View className='flex-1 items-center justify-center'>
      <Text>Create Group</Text>
      <Button title="Cancel and Go Back" onPress={() => {
        router.back()
      }} />
      <Button title="Create Group" onPress={() => {}} />
    </View>
  )
}