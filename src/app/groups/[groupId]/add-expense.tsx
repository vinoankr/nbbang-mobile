import React from 'react'
import { Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

export default function AddExpense() {
  const { groupId, currency } = useLocalSearchParams<{ 
    groupId: string
    currency: string 
  }>()
  
  return (
    <View>  
      <Text>Add Expense for Group: {groupId}</Text>
      <Text>Currency: {currency}</Text>
    </View>
  )
} 