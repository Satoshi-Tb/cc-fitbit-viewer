import { NextResponse } from "next/server";
import { ApiResponse, DailySummary } from "@/types";
import { FitbitAPI } from "@/lib/fitbit";

export async function GET(): Promise<NextResponse<ApiResponse<DailySummary>>> {
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

    return NextResponse.json({
      data: dailySummary,
      success: true,
    });
  } catch (error) {
    console.error("Fitbit API error:", error);
    return NextResponse.json(
      {
        data: {} as DailySummary,
        success: false,
        error: `Failed to fetch daily summary: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
