import { Hono } from "hono";
import { handle } from "hono/vercel";
import { ApiResponse, CalorieData } from "@/types";
import { FitbitAPI } from "@/lib/fitbit";

const app = new Hono().basePath("/api/fitbit/calories");

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

app.get("/", async (c) => {
  try {
    const period = (c.req.query('period') as 'week' | 'month') || 'week';
    const endDateParam = c.req.query('endDate');

    const fitbitAPI = new FitbitAPI();
    const { startDate, endDate } = getDateRange(period, endDateParam || undefined);
    
    const calorieData = await fitbitAPI.getCaloriesAndWeightTimeSeries(startDate, endDate);

    const response: ApiResponse<CalorieData[]> = {
      data: calorieData,
      success: true
    };

    return c.json(response);
  } catch (error) {
    console.error('Error in calories API:', error);

    const errorResponse: ApiResponse<CalorieData[]> = {
      data: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };

    return c.json(errorResponse, 500);
  }
});

export const GET = handle(app);