'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { CalorieData, ApiResponse } from '@/types';
import { useAtom } from 'jotai';
import { baseDateAtom } from '@/store/atoms';

export function useCalorieData(period: 'week' | 'month') {
  const [baseDate] = useAtom(baseDateAtom);
  const dateString = baseDate.toISOString().split('T')[0];
  
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<CalorieData[]>>(
    `/api/fitbit/calories?period=${period}&baseDate=${dateString}`,
    fetcher,
    {
      refreshInterval: 300000, // 5分間隔で自動更新
      revalidateOnFocus: true,
      dedupingInterval: 60000,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  return {
    data: data?.data || [],
    error,
    isLoading,
    mutate,
    success: data?.success ?? false
  };
}