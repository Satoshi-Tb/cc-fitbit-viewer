import { Hono } from "hono";
import { handle } from "hono/vercel";
import { ApiResponse, DailySummary } from "@/types";
import { FitbitAPI } from "@/lib/fitbit";

const app = new Hono().basePath("/api/fitbit/daily-summary");

app.get("/", async (c) => {
  try {
    const fitbitAPI = new FitbitAPI();
    const dateParam = c.req.query("date");
    const targetDate = dateParam || new Date().toISOString().split("T")[0];

    // Fetch real data from Fitbit API
    const [activityData, caloriesConsumed, weight] = await Promise.all([
      fitbitAPI.getActivityData(targetDate),
      fitbitAPI.getNutritionData(targetDate),
      fitbitAPI.getWeightData(targetDate),
    ]);

    const dailySummary: DailySummary = {
      caloriesBurned: activityData.caloriesOut,
      caloriesConsumed,
      weight,
      steps: activityData.steps,
      date: targetDate,
    };

    const response: ApiResponse<DailySummary> = {
      data: dailySummary,
      success: true,
    };

    return c.json(response);
  } catch (error) {
    console.error("Fitbit API error:", error);

    const errorResponse: ApiResponse<DailySummary> = {
      data: {} as DailySummary,
      success: false,
      error: `Failed to fetch daily summary: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };

    return c.json(errorResponse, 500);
  }
});

export const GET = handle(app);
