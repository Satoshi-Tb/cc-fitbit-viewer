import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { ApiResponse, DailySummary } from '@/types';

export function useFitbitData(endpoint: string) {
  return useSWR<ApiResponse<DailySummary>>(`/api/fitbit/${endpoint}`, fetcher, {
    dedupingInterval: 60000,
    errorRetryCount: 3,
    revalidateOnMount: true,
  });
}

export function useDailySummary() {
  return useFitbitData('daily-summary');
}