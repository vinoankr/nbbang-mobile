import { Redirect } from 'expo-router';
import React from 'react'
import { mmkvStorage } from '../utils/storage';

export default function index() {
  const isAuthenticated = mmkvStorage.getItem('authToken');
  const primaryGroupId = mmkvStorage.getItem('primaryGroupId');
  if (isAuthenticated) {
    if (primaryGroupId) {
      return <Redirect href={`/groups/${primaryGroupId}`} />;
    }
    return <Redirect href="/groups" />;
  }
  return <Redirect href="/auth" />;
}
