import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { ApiResponse, DailySummary } from "@/types";

export function useFitbitData(endpoint: string) {
  return useSWR<ApiResponse<DailySummary>>(`/api/fitbit/${endpoint}`, fetcher, {
    errorRetryCount: 3,
    errorRetryInterval: 5000,
  });
}

export function useDailySummary() {
  return useFitbitData("daily-summary");
}
