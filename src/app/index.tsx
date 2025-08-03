import { Redirect } from 'expo-router';
import React from 'react'
import { getAuthToken, getUserData } from '../utils/client';

export default function App() {
  const isAuthenticated = getAuthToken();
  const userData = getUserData();
  const primaryGroupId = (typeof userData?.primary_group_id === 'string')
    ? userData.primary_group_id
    : null;

  if (isAuthenticated) {
    if (primaryGroupId) {
      return <Redirect href={`/groups?goto=${primaryGroupId}`}  />;
    }
    return <Redirect href="/groups"  />;
  }
  return <Redirect href="/auth" />;
}