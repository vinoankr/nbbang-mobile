import { Redirect } from 'expo-router';
import React from 'react'
import { storage } from '../utils/storage';

export default function index() {
  const isAuthenticated = storage.getString('token');
  const primaryGroupId = storage.getString('primaryGroupId');
  if (isAuthenticated) {
    if (primaryGroupId) {
      return <Redirect href={`/groups/${primaryGroupId}`} />;
    }
    return <Redirect href="/groups" />;
  }
  return <Redirect href="/auth" />;
}
