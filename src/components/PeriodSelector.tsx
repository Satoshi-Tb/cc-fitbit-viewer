'use client';

import { PeriodSelectorProps } from '@/types';

export default function PeriodSelector({ period, onPeriodChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => onPeriodChange('week')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          period === 'week'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        1週間
      </button>
      <button
        onClick={() => onPeriodChange('month')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          period === 'month'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        1ヶ月
      </button>
    </div>
  );
}