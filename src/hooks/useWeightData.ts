import useSWR from 'swr';
import { useAtom } from 'jotai';
import { baseDateAtom } from '@/store/atoms';

interface WeightData {
  date: string;
  weight?: number;
  bodyFat?: number;
}

interface WeightResponse {
  data: WeightData[];
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
}

const fetcher = async (url: string): Promise<WeightResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch weight data');
  }
  return response.json();
};

export function useWeightData(period: string) {
  const [baseDate] = useAtom(baseDateAtom);
  const dateString = baseDate.toISOString().split('T')[0];
  
  const { data, error, isLoading, mutate } = useSWR<WeightResponse>(
    `/api/fitbit/weight?period=${period}&baseDate=${dateString}`,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    data: data?.data || [],
    error,
    isLoading,
    mutate,
  };
}