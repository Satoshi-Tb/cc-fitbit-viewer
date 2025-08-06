'use client';

import { useState } from 'react';
import { useFoodLogData } from '@/hooks/useFoodLogData';
import { DailyFoodLog } from '@/lib/fitbit';

interface FoodLogListProps {
  baseDate: Date;
  period: 'week' | 'month';
  onShowDetails: (foodLog: DailyFoodLog) => void;
}

interface FoodLogRowProps {
  date: string;
  onShowDetails: (foodLog: DailyFoodLog) => void;
}

function formatDateWithDay(dateString: string): string {
  const date = new Date(dateString);
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const dayOfWeek = dayNames[date.getDay()];
  return `${dateString} (${dayOfWeek})`;
}

function FoodLogRow({ date, onShowDetails }: FoodLogRowProps) {
  const { data: foodLog, error, isLoading } = useFoodLogData(date);

  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 mb-2">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-200 rounded-lg p-4 mb-2 bg-red-50">
        <div className="text-red-600 text-sm">
          {formatDateWithDay(date)}: データ取得エラー
        </div>
      </div>
    );
  }

  // 食品データなしの場合は何も表示しない
  if (!foodLog || foodLog.entries.length === 0) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-2 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <div className="text-sm font-medium text-gray-900 mb-1">
            {formatDateWithDay(date)}
          </div>
          <div className="text-sm text-gray-600 mb-2 break-words">
            {foodLog.foodSummary}
          </div>
          <div className="text-sm font-semibold text-blue-600">
            合計: {foodLog.totalCalories.toLocaleString()} kcal
          </div>
        </div>
        <button
          onClick={() => onShowDetails(foodLog)}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors whitespace-nowrap"
        >
          詳細表示
        </button>
      </div>
    </div>
  );
}

function getDateRange(period: 'week' | 'month', baseDate: Date): string[] {
  const daysToGet = period === 'week' ? 7 : 30;
  const dates: string[] = [];
  
  for (let i = 0; i < daysToGet; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i); // Go backwards from base date
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates; // Already in descending order (newest first)
}

export function FoodLogList({ baseDate, period, onShowDetails }: FoodLogListProps) {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const initialDates = getDateRange(period, baseDate);
  
  const sortedDates = [...initialDates].sort((a, b) => {
    return sortOrder === 'desc' 
      ? b.localeCompare(a) // 降順 (新しい日付が上)
      : a.localeCompare(b); // 昇順 (古い日付が上)
  });

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  return (
    <div className="space-y-4">
      {/* Sort Button */}
      <div className="flex justify-end">
        <button
          onClick={toggleSortOrder}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <span>日付順</span>
          <svg 
            className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
          <span className="text-xs text-gray-500">
            ({sortOrder === 'desc' ? '新→古' : '古→新'})
          </span>
        </button>
      </div>

      {/* Food Log List */}
      <div className="space-y-2">
        {sortedDates.map(date => (
          <FoodLogRow
            key={date}
            date={date}
            onShowDetails={onShowDetails}
          />
        ))}
      </div>
    </div>
  );
}