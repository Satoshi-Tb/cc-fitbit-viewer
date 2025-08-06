import { Hono } from "hono";
import { handle } from "hono/vercel";
import { ApiResponse } from "@/types";
import { FitbitAPI, DailyFoodLog } from "@/lib/fitbit";

const app = new Hono().basePath("/api/fitbit/food-log");

app.get("/", async (c) => {
  try {
    const date = c.req.query('date');
    
    if (!date) {
      const errorResponse: ApiResponse<DailyFoodLog | null> = {
        data: null,
        success: false,
        error: 'Date parameter is required'
      };
      return c.json(errorResponse, 400);
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      const errorResponse: ApiResponse<DailyFoodLog | null> = {
        data: null,
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      };
      return c.json(errorResponse, 400);
    }

    const fitbitAPI = new FitbitAPI();
    const foodLogData = await fitbitAPI.getFoodLog(date);

    const response: ApiResponse<DailyFoodLog> = {
      data: foodLogData,
      success: true
    };

    return c.json(response);
  } catch (error) {
    console.error('Error in food-log API:', error);

    const errorResponse: ApiResponse<DailyFoodLog | null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };

    return c.json(errorResponse, 500);
  }
});

export const GET = handle(app);