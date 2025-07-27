import { Redirect } from 'expo-router';
import React from 'react'
import { getAuthToken, getUserData } from '../utils/client';

export default function App() {
  const isAuthenticated = getAuthToken();
  const primaryGroupId = getUserData()?.primary_group_id;

  if (isAuthenticated) {
    return <Redirect href={`/groups?goto=${primaryGroupId}`}  />;
  }
  return <Redirect href="/auth" />;
}