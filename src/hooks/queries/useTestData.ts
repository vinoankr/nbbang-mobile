import { client } from '../../utils/client';
import { useQuery } from '@tanstack/react-query';

export interface TestData {
  id: number;
  country: string;
  city: string;
  created_at?: string;
}

export const useTestData = () => {
  return useQuery({
    queryKey: ['test-data'],
    queryFn: async (): Promise<TestData[]> => {
      const { data } = await client.get('/slow-get');
      console.log(data.data);
      return data.data;
    },
    staleTime: 300000, // 5분
  });
}; 