import { Hono } from "hono";
import { handle } from "hono/vercel";
import { FitbitAPI } from "@/lib/fitbit";

const app = new Hono().basePath("/api/fitbit/weight");

app.get("/", async (c) => {
  try {
    const { searchParams } = new URL(c.req.url);
    const period = searchParams.get("period") || "1m";
    
    const fitbit = new FitbitAPI();
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case "1w":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "1m":
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case "3m":
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case "6m":
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 1);
    }
    
    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];
    
    const data = await fitbit.getWeightAndBodyFatTimeSeries(startDateStr, endDateStr);
    
    return c.json({
      data,
      period,
      dateRange: {
        start: startDateStr,
        end: endDateStr,
      },
    });
  } catch (error) {
    console.error("Error fetching weight data:", error);
    return c.json({ error: "Failed to fetch weight data" }, 500);
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);