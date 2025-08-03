'use client';

import { useState } from 'react';
import Link from 'next/link';
import CalorieChart from '@/components/CalorieChart';
import PeriodSelector from '@/components/PeriodSelector';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useCalorieData } from '@/hooks/useCalorieData';

export default function CaloriesPage() {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const { data, error, isLoading, mutate } = useCalorieData(period);

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <nav className="flex gap-4">
              <Link 
                href="/" 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ダッシュボード
              </Link>
              <Link 
                href="/calories" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                カロリートレンド
              </Link>
            </nav>
          </div>
          <h1 className="text-3xl font-bold mb-6">カロリートレンド</h1>
          <ErrorBoundary error={error} retry={() => mutate()} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <nav className="flex gap-4">
            <Link 
              href="/" 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ダッシュボード
            </Link>
            <Link 
              href="/calories" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              カロリートレンド
            </Link>
          </nav>
        </div>
        <h1 className="text-3xl font-bold mb-6">カロリートレンド</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <PeriodSelector period={period} onPeriodChange={setPeriod} />
        </div>
        
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <div>
            <CalorieChart data={data} period={period} />
            
            {data.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">平均消費カロリー</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {(() => {
                      const validData = data.filter(item => item.caloriesOut > 0);
                      return validData.length > 0 
                        ? Math.round(validData.reduce((sum, item) => sum + item.caloriesOut, 0) / validData.length).toLocaleString()
                        : '0';
                    })()} kcal
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">平均摂取カロリー</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {(() => {
                      const validData = data.filter(item => item.caloriesIn > 0);
                      return validData.length > 0 
                        ? Math.round(validData.reduce((sum, item) => sum + item.caloriesIn, 0) / validData.length).toLocaleString()
                        : '0';
                    })()} kcal
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">平均カロリー差</h3>
                  <p className={`text-2xl font-bold ${
                    (() => {
                      const validData = data.filter(item => item.caloriesOut > 0 && item.caloriesIn > 0);
                      const avgDiff = validData.length > 0 
                        ? validData.reduce((sum, item) => sum + (item.caloriesOut - item.caloriesIn), 0) / validData.length
                        : 0;
                      return avgDiff > 0 ? 'text-green-600' : 'text-orange-600';
                    })()
                  }`}>
                    {(() => {
                      const validData = data.filter(item => item.caloriesOut > 0 && item.caloriesIn > 0);
                      return validData.length > 0 
                        ? Math.round(validData.reduce((sum, item) => sum + (item.caloriesOut - item.caloriesIn), 0) / validData.length).toLocaleString()
                        : '0';
                    })()} kcal
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}