import axios, { AxiosInstance } from 'axios';
import { mmkvStorage } from './storage';
import { router } from 'expo-router';

// const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const API_BASE_URL = 'http://localhost:3000';

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

const getAuthToken = () => {
  return mmkvStorage.getItem('authToken');
}

const removeAuthToken = () => {
  mmkvStorage.removeItem('authToken');
}

const removeUserData = () => {
  mmkvStorage.removeItem('userData');
}