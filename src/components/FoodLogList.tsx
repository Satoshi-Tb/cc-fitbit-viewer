'use client';

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
          {date}: データ取得エラー
        </div>
      </div>
    );
  }

  if (!foodLog || foodLog.entries.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 mb-2 bg-gray-50">
        <div className="text-gray-500 text-sm">
          {date}: 食品データなし
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-2 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <div className="text-sm font-medium text-gray-900 mb-1">
            {date}
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
  const dates = getDateRange(period, baseDate);

  return (
    <div className="space-y-2">
      {dates.map(date => (
        <FoodLogRow
          key={date}
          date={date}
          onShowDetails={onShowDetails}
        />
      ))}
    </div>
  );
}