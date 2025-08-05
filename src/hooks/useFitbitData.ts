import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { ApiResponse, DailySummary } from "@/types";
import { useAtom } from 'jotai';
import { baseDateAtom } from '@/store/atoms';

export function useFitbitData(endpoint: string) {
  return useSWR<ApiResponse<DailySummary>>(`/api/fitbit/${endpoint}`, fetcher, {
    errorRetryCount: 3,
    errorRetryInterval: 5000,
  });
}

export function useDailySummary() {
  const [baseDate] = useAtom(baseDateAtom);
  const dateString = baseDate.toISOString().split('T')[0];
  
  return useSWR<ApiResponse<DailySummary>>(
    `/api/fitbit/daily-summary?date=${dateString}`, 
    fetcher, 
    {
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );
}
