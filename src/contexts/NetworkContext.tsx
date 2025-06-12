import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { 
  retryOfflineMutations, 
} from '../utils/offlineQueue';

interface NetworkContextType {
  isConnected: boolean | null;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const isRetrying = useRef<boolean>(false);

  useEffect(() => {
    // 네트워크 상태 모니터링
    const unsubscribe = NetInfo.addEventListener(async state => {
      setIsConnected(state.isConnected);
      
      // 인터넷 연결 시 오프라인 큐 자동 재시도
      if (state.isConnected && !isRetrying.current) {
        isRetrying.current = true;
        await retryOfflineMutations();
        isRetrying.current = false;
      }
    });

    return () => unsubscribe();
  }, []);

  const value: NetworkContextType = {
    isConnected,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}; 