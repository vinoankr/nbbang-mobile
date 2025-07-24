import { useQuery } from "@tanstack/react-query";
import { client } from '@/src/utils/client';

// 백엔드 API에서 환율 정보를 가져오는 함수
const getCurrenciesRates = async () => {
  const response = await client.get('/currency');
  return response.data.data;
};

// 환율 정보를 가져오는 훅 - 하루(12시간) 동안 캐싱
export const useCurrenciesRates = () => {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: getCurrenciesRates,
    staleTime: 12 * 60 * 60 * 1000,
  });
}; 