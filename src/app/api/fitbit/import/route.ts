import { Hono } from "hono";
import { handle } from "hono/vercel";
import { FitbitAPI } from "@/lib/fitbit";

const app = new Hono().basePath("/api/fitbit/import");

interface ImportResponse {
  success: boolean;
  message: string;
  results?: {
    success: number;
    failed: number;
    errors: string[];
  };
}

app.post("/csv", async (c) => {
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
    
    // Parse CSV data
    const csvData = fitbit.parseCSVData(csvContent);
    
    if (csvData.length === 0) {
      return c.json({
        success: false,
        message: "No valid data found in CSV"
      } as ImportResponse, 400);
    }

    // Import data to Fitbit
    const results = await fitbit.importCSVData(csvData);
    
    const response: ImportResponse = {
      success: results.failed === 0,
      message: results.failed === 0 
        ? `Successfully imported ${results.success} records`
        : `Import completed with ${results.success} successes and ${results.failed} failures`,
      results
    };

    return c.json(response, results.failed === 0 ? 200 : 207); // 207 Multi-Status for partial success
  } catch (error) {
    console.error("Error importing CSV data:", error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return c.json({
      success: false,
      message: `Failed to import CSV data: ${errorMessage}`
    } as ImportResponse, 500);
  }
});

app.post("/validate", async (c) => {
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