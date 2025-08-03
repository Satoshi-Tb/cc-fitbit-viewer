'use client';

import { useDailySummary } from '@/hooks/useFitbitData';
import { ErrorBoundary } from './ErrorBoundary';
import { SkeletonLoader } from './SkeletonLoader';
import { MetricCard } from './MetricCard';

export function Dashboard() {
  const { data, error, isLoading, mutate } = useDailySummary();

  if (error) {
    return <ErrorBoundary error={error} retry={() => mutate()} />;
  }

  if (isLoading || !data) {
    return <SkeletonLoader />;
  }

  const { caloriesBurned, caloriesConsumed, weight, steps } = data.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="消費カロリー"
          value={caloriesBurned}
          unit="kcal"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-7 0 0 .5 2.5 2.5 3.5 0-2 1-5 3-5a8 8 0 01-1.343 11.657z" />
            </svg>
          }
        />

        <MetricCard
          title="摂取カロリー"
          value={caloriesConsumed}
          unit="kcal"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13h3m7 0a2 2 0 11-4 0m4 0a2 2 0 11-4 0m0 0H7" />
            </svg>
          }
        />

        <MetricCard
          title="体重"
          value={weight}
          unit="kg"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />

        <MetricCard
          title="歩数"
          value={steps}
          unit="歩"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
      </div>
    </div>
  );
}