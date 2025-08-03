import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { ApiResponse, DailySummary } from "@/types";
import { FitbitAPI } from "@/lib/fitbit";

const app = new Hono().basePath("/api/fitbit/daily-summary");

app.use("*", cors());
app.use("*", logger());

app.get("/", async (c) => {
  try {
    const fitbitAPI = new FitbitAPI();
    const today = new Date().toISOString().split("T")[0];

    // Fetch real data from Fitbit API
    const [activityData, caloriesConsumed, weight] = await Promise.all([
      fitbitAPI.getActivityData(today),
      fitbitAPI.getNutritionData(today),
      fitbitAPI.getWeightData(today),
    ]);

    const dailySummary: DailySummary = {
      caloriesBurned: activityData.caloriesOut,
      caloriesConsumed,
      weight,
      steps: activityData.steps,
      date: today,
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
