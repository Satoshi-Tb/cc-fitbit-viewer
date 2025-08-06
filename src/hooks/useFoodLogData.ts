'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { ApiResponse } from '@/types';
import { DailyFoodLog } from '@/lib/fitbit';

export function useFoodLogData(date: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<DailyFoodLog>>(
    date ? `/api/fitbit/food-log?date=${date}` : null,
    fetcher,
    {
      refreshInterval: 0, // 食品ログは自動更新不要
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5分間は同じデータを使用
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  return {
    data: data?.data || null,
    error,
    isLoading,
    mutate,
    success: data?.success ?? false
  };
}