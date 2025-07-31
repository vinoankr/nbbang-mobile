import { Stack } from 'expo-router'
import React from 'react'

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "white" } }}>
      <Stack.Screen name="index" options={{ animation: 'none', contentStyle: { backgroundColor: "#2C7FFF" } }} />
      <Stack.Screen name="phone" options={{ animation: 'none' }} />
    </Stack>
  )
}