import { useQuery } from '@tanstack/react-query';
import { client } from '@/src/utils/client';

interface CurrencyMetadata {
  source: string;
  updated_at: string | null;
}

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export const useCurrencyMetadata = () => {
  const query = useQuery({
    queryKey: ['currencyMetadata'],
    queryFn: async () => {
      const response = await client.get<{ data: CurrencyMetadata }>('/currency/metadata');
      return response.data.data;
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const updatedAt = query.data?.updated_at ? new Date(query.data.updated_at) : null;

  return {
    ...query,
    updatedAtText: updatedAt && !Number.isNaN(updatedAt.getTime())
      ? `${dateFormatter.format(updatedAt)} (한국 시간)`
      : null,
  };
};
