export interface DailySummary {
  caloriesBurned: number;
  caloriesConsumed: number;
  weight: number;
  steps: number;
  date: string;
}

export interface FitbitData {
  activities: {
    steps: number;
    calories: number;
  };
  nutrition: {
    calories: number;
  };
  body: {
    weight: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface ErrorBoundaryProps {
  error: Error;
  retry: () => void;
}

export interface CalorieData {
  date: string;
  caloriesOut: number;
  caloriesIn: number;
}

export interface FitbitTimeSeriesItem {
  dateTime: string;
  value: string;
}

export interface CalorieChartProps {
  data: CalorieData[];
  period: 'week' | 'month';
}

export interface PeriodSelectorProps {
  period: 'week' | 'month';
  onPeriodChange: (period: 'week' | 'month') => void;
}