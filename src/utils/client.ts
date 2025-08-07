import axios, { AxiosInstance } from 'axios';
import { mmkvStorage } from './storage';
import { router } from 'expo-router';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// axios 인스턴스 생성
export const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 추가
client.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } 
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 401 에러 처리
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeAuthToken();
      removeUserData();
      router.replace('/');
    }
    return Promise.reject(error);
  }
);

export const getAuthToken = () => {
  return mmkvStorage.getItem('authToken');
}

export const setAuthToken = (token: string) => {
  mmkvStorage.setItem('authToken', token);
}

export const removeAuthToken = () => {
  mmkvStorage.removeItem('authToken');
}

export const getUserData = () => {
  const userData = mmkvStorage.getItem('userData');
  if (userData) {
    const parsed = JSON.parse(userData);
    if (typeof parsed === 'object') {
      return parsed;
    }
  }
  return null;
}

export const setUserData = (userData: any) => {
  mmkvStorage.setItem('userData', JSON.stringify(userData));
}

export const removeUserData = () => {
  mmkvStorage.removeItem('userData');
}

// Apple 로그인 API 호출
export const signInWithApple = async (user: string, fullName: string | null, email: string | null) => {
  try {
    const response = await client.post('/auth/apple', {
      user,
      fullName,
      email,
    });
    
    if (response.data.success) {
      const { token, user } = response.data;
      setAuthToken(token);
      setUserData(user);
      return { success: true, user };
    } else {
      throw new Error(response.data.error || 'Apple 로그인에 실패했습니다.');
    }
  } catch (error: any) {
    console.error('Apple 로그인 오류:', error);
    throw new Error(error.response?.data?.error || 'Apple 로그인에 실패했습니다.');
  }
};