import { Redirect } from 'expo-router';
import React from 'react'
import { getAuthToken, getUserData } from '../utils/client';

export default function App() {
  const isAuthenticated = getAuthToken();
  const primaryGroupId = getUserData()?.primary_group_id;

  if (isAuthenticated) {
    if (primaryGroupId) {
      return <Redirect href={`/groups/${primaryGroupId}`} />;
    }
    return <Redirect href="/groups" />;
  }
  return <Redirect href="/auth" />;
}