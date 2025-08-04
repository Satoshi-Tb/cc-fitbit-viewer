'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { CalorieData, ApiResponse } from '@/types';

export function useCalorieData(period: 'week' | 'month') {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<CalorieData[]>>(
    `/api/fitbit/calories?period=${period}`,
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