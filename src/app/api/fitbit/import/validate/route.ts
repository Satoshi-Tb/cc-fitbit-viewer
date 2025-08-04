import { Hono } from "hono";
import { handle } from "hono/vercel";
import { FitbitAPI } from "@/lib/fitbit";

const app = new Hono().basePath("/api/fitbit/import/validate");

interface ImportResponse {
  success: boolean;
  message: string;
  results?: {
    success: number;
    failed: number;
    errors: string[];
  };
}

app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const { csvContent } = body;

    if (!csvContent || typeof csvContent !== 'string') {
      return c.json({
        success: false,
        message: "CSV content is required"
      } as ImportResponse, 400);
    }

    const fitbit = new FitbitAPI();
    
    // Parse and validate CSV data
    const csvData = fitbit.parseCSVData(csvContent);
    
    return c.json({
      success: true,
      message: `CSV validation successful. Found ${csvData.length} valid records`,
      results: {
        success: csvData.length,
        failed: 0,
        errors: []
      }
    } as ImportResponse);
  } catch (error) {
    console.error("Error validating CSV data:", error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return c.json({
      success: false,
      message: `CSV validation failed: ${errorMessage}`
    } as ImportResponse, 400);
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);