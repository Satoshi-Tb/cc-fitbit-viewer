import { NextRequest, NextResponse } from 'next/server';
import { FitbitAPI } from '@/lib/fitbit';

interface CalorieData {
  date: string;
  caloriesOut: number;
  caloriesIn: number;
}

function getDateRange(period: 'week' | 'month', endDate?: string): string[] {
  const end = endDate ? new Date(endDate) : new Date();
  const dates: string[] = [];
  
  const daysToGet = period === 'week' ? 7 : 30;
  
  for (let i = daysToGet - 1; i >= 0; i--) {
    const date = new Date(end);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') as 'week' | 'month') || 'week';
    const endDate = searchParams.get('endDate');

    const fitbitAPI = new FitbitAPI();
    const dates = getDateRange(period, endDate || undefined);
    
    const calorieData: CalorieData[] = await Promise.all(
      dates.map(async (date) => {
        try {
          const [activityData, nutritionCalories] = await Promise.all([
            fitbitAPI.getActivityData(date),
            fitbitAPI.getNutritionData(date)
          ]);
          
          return {
            date,
            caloriesOut: activityData.caloriesOut,
            caloriesIn: nutritionCalories
          };
        } catch (error) {
          console.error(`Error fetching data for ${date}:`, error);
          return {
            date,
            caloriesOut: 0,
            caloriesIn: 0
          };
        }
      })
    );

    return NextResponse.json({
      data: calorieData,
      success: true
    });
  } catch (error) {
    console.error('Error in calories API:', error);
    return NextResponse.json(
      {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}