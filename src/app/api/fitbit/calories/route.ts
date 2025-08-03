import { NextRequest, NextResponse } from 'next/server';
import { FitbitAPI } from '@/lib/fitbit';

function getDateRange(period: 'week' | 'month', endDate?: string): { startDate: string; endDate: string } {
  const end = endDate ? new Date(endDate) : new Date();
  const daysToGet = period === 'week' ? 7 : 30;
  
  const start = new Date(end);
  start.setDate(start.getDate() - (daysToGet - 1));
  
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0]
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') as 'week' | 'month') || 'week';
    const endDateParam = searchParams.get('endDate');

    const fitbitAPI = new FitbitAPI();
    const { startDate, endDate } = getDateRange(period, endDateParam || undefined);
    
    const calorieData = await fitbitAPI.getCaloriesTimeSeries(startDate, endDate);

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