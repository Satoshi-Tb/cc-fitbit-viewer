import { NextResponse } from 'next/server';
import { ApiResponse, DailySummary } from '@/types';

export async function GET(): Promise<NextResponse<ApiResponse<DailySummary>>> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const mockData: DailySummary = {
      caloriesBurned: 2150,
      caloriesConsumed: 1800,
      weight: 70.5,
      steps: 8500,
      date: today,
    };

    return NextResponse.json({
      data: mockData,
      success: true,
    });
  } catch {
    return NextResponse.json(
      {
        data: {} as DailySummary,
        success: false,
        error: 'Failed to fetch daily summary',
      },
      { status: 500 }
    );
  }
}