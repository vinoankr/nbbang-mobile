import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { client, setAuthToken, setUserData } from '../utils/client';
import { AxiosError } from 'axios';
import { BankName } from '@/src/constants/banks';
import Toast from 'react-native-toast-message';
import { useNetInfo } from '@react-native-community/netinfo';

export type AuthStep = 'phone' | 'verify' | 'name';


interface AuthResponse {
  success: boolean;
  message: string;
  error?: string;
}

interface VerifyResponse extends AuthResponse {
  isNewUser: boolean;
  token?: string;
  signupToken?: string;
  user?: {
    id: string;
    name: string;
    phone_number: string;
    primary_group_id: string | null;
  };
}

interface SignupResponse extends AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    phone_number: string;
    primary_group_id: string | null;
    bank: BankName;
    account_number: string;
  };
}

interface UsePhoneAuthReturn {
  step: AuthStep;
  phoneNumber: string;
  verificationCode: string;
  isLoading: boolean;
  error: string | null;
  setPhoneNumber: (phone: string) => void;
  setVerificationCode: (code: string) => void;
  handleSendOtp: () => Promise<void>;
  handleVerifyOtp: () => Promise<void>;
  handleUpdateProfile: (data: { name: string, bank: BankName, accountNumber: string }) => Promise<void>;
}

export const usePhoneAuth = (redirectGroupId: string | null): UsePhoneAuthReturn => {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState<string>('010-');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [signupToken, setSignupToken] = useState<string | null>(null);
  const { isInternetReachable } = useNetInfo();

  // 인증번호 전송
  const handleSendOtp = async () => {
    if (!isInternetReachable) {
      Alert.alert('오류', '인터넷 연결 후 다시 시도해주세요.');
      return;
    }

    if (!phoneNumber || phoneNumber.length < 13) {
      Alert.alert('오류', '올바른 전화번호를 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await client.post<AuthResponse>('/auth/phone', {
        phone_number: phoneNumber.replace(/-/g, '')
      });

      if (!data.success) {
        throw new Error(data.error || '인증 코드 발송에 실패했습니다.');
      }
      
      setStep('verify');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 인증번호 확인
  const handleVerifyOtp = async () => {
    if (!isInternetReachable) {
      Alert.alert('오류', '인터넷 연결 후 다시 시도해주세요.');
      return;
    }

    if (!verificationCode || verificationCode.length < 6) {
      Alert.alert('오류', '인증번호를 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await client.post<VerifyResponse>('/auth/verify', {
        phone_number: phoneNumber.replace(/-/g, ''),
        auth_code: verificationCode,
        platform: Platform.OS
      });

      if (!data.success) {
        throw new Error(data.error || '인증에 실패했습니다.');
      }

      if (data.isNewUser && data.signupToken) {
        // 신규 유저 - 회원가입 필요
        setSignupToken(data.signupToken);
        setStep('name');
      } else if (data.token) {
        // 기존 유저 - 로그인 완료
        setAuthToken(data.token);
        setUserData(data.user);
        if (redirectGroupId) {
          router.dismissTo('/');
          router.replace(`/groups/${redirectGroupId}` as any);
        } else {
          router.dismissTo('/');
        }
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 프로필 업데이트
  const handleUpdateProfile = async (
    data: { name: string, bank: BankName, accountNumber: string }
  ) => {
    if (!isInternetReachable) {
      Alert.alert('오류', '인터넷 연결 후 다시 시도해주세요.');
      return;
    }

    if (!data.name || !data.bank || !data.accountNumber) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (!signupToken) {
        throw new Error('회원가입 토큰이 없습니다.');
      }
      
      const { data: responseData } = await client.post<SignupResponse>('/auth/signup', {
        signupToken,
        name: data.name,
        bank: data.bank,
        account_number: data.accountNumber,
        platform: Platform.OS
      });

      if (!responseData.success) {
        throw new Error(responseData.error || '회원가입에 실패했습니다.');
      }
      Toast.show({
        type: 'success',
        text1: '🔥 가입을 환영합니다!',
        visibilityTime: 1500,
      });

      // 로그인 토큰 저장
      setAuthToken(responseData.token);
      setUserData(responseData.user);
      if (redirectGroupId) {
        router.dismissTo('/');
        router.replace(`/groups/${redirectGroupId}` as any);
      } else {
        router.dismissTo('/');
      }

    } catch {
      setError('회원가입에 실패했습니다.');
      setIsLoading(false);
    }
  };

  return {
    step,
    phoneNumber,
    verificationCode,
    isLoading,
    error,
    setPhoneNumber,
    setVerificationCode,
    handleSendOtp,
    handleVerifyOtp,
    handleUpdateProfile,
  };
}; 