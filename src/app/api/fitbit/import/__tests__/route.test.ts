import { POST } from "../route";
import { FitbitAPI } from "@/lib/fitbit";

// Mock the FitbitAPI
jest.mock("@/lib/fitbit");

interface MockFitbitInstance {
  parseCSVData: jest.Mock;
  importCSVData: jest.Mock;
}

describe("/api/fitbit/import", () => {
  const mockFitbitAPI = FitbitAPI as jest.MockedClass<typeof FitbitAPI>;

  beforeEach(() => {
    mockFitbitAPI.mockClear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("POST /csv", () => {
    it("should successfully import CSV data", async () => {
      const mockCsvData = [
        { date: "2025-05-05", weight: 66.0, bodyFat: 13.2 },
        { date: "2025-05-06", weight: 66.0, bodyFat: 12.6 },
      ];

      const mockImportResult = {
        success: 2,
        failed: 0,
        errors: []
      };

      const mockInstance: MockFitbitInstance = {
        parseCSVData: jest.fn().mockReturnValue(mockCsvData),
        importCSVData: jest.fn().mockResolvedValue(mockImportResult),
      };

      mockFitbitAPI.mockImplementation(
        () => mockInstance as unknown as FitbitAPI
      );

      const csvContent = `日付,体重(kg),体脂肪率(%)
2025/5/5,66.0,13.2
2025/5/6,66.0,12.6`;

      const mockRequest = new Request(
        "http://localhost:3000/api/fitbit/import/csv",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvContent }),
        }
      );

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe("Successfully imported 2 records");
      expect(responseData.results).toEqual(mockImportResult);

      expect(mockInstance.parseCSVData).toHaveBeenCalledWith(csvContent);
      expect(mockInstance.importCSVData).toHaveBeenCalledWith(mockCsvData);
    });

    it("should handle partial import success", async () => {
      const mockCsvData = [
        { date: "2025-05-05", weight: 66.0, bodyFat: 13.2 },
        { date: "2025-05-06", weight: 66.0, bodyFat: 12.6 },
      ];

      const mockImportResult = {
        success: 1,
        failed: 1,
        errors: ["2025-05-06: Failed to log weight: Unauthorized"]
      };

      const mockInstance: MockFitbitInstance = {
        parseCSVData: jest.fn().mockReturnValue(mockCsvData),
        importCSVData: jest.fn().mockResolvedValue(mockImportResult),
      };

      mockFitbitAPI.mockImplementation(
        () => mockInstance as unknown as FitbitAPI
      );

      const csvContent = `日付,体重(kg),体脂肪率(%)
2025/5/5,66.0,13.2
2025/5/6,66.0,12.6`;

      const mockRequest = new Request(
        "http://localhost:3000/api/fitbit/import/csv",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvContent }),
        }
      );

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(207); // Multi-Status
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe("Import completed with 1 successes and 1 failures");
      expect(responseData.results).toEqual(mockImportResult);
    });

    it("should handle missing CSV content", async () => {
      const mockRequest = new Request(
        "http://localhost:3000/api/fitbit/import/csv",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe("CSV content is required");
    });

    it("should handle empty CSV data", async () => {
      const mockInstance: MockFitbitInstance = {
        parseCSVData: jest.fn().mockReturnValue([]),
        importCSVData: jest.fn(),
      };

      mockFitbitAPI.mockImplementation(
        () => mockInstance as unknown as FitbitAPI
      );

      const csvContent = `日付,体重(kg),体脂肪率(%)`;

      const mockRequest = new Request(
        "http://localhost:3000/api/fitbit/import/csv",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvContent }),
        }
      );

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe("No valid data found in CSV");
      expect(mockInstance.importCSVData).not.toHaveBeenCalled();
    });

    it("should handle CSV parsing errors", async () => {
      const mockInstance: MockFitbitInstance = {
        parseCSVData: jest.fn().mockImplementation(() => {
          throw new Error("Invalid CSV format. Expected headers: 日付, 体重(kg), 体脂肪率(%)");
        }),
        importCSVData: jest.fn(),
      };

      mockFitbitAPI.mockImplementation(
        () => mockInstance as unknown as FitbitAPI
      );

      const csvContent = `date,weight,bodyfat
2025/5/5,66.0,13.2`;

      const mockRequest = new Request(
        "http://localhost:3000/api/fitbit/import/csv",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvContent }),
        }
      );

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe("Failed to import CSV data: Invalid CSV format. Expected headers: 日付, 体重(kg), 体脂肪率(%)");
    });

    it("should handle import API errors", async () => {
      const mockCsvData = [
        { date: "2025-05-05", weight: 66.0, bodyFat: 13.2 },
      ];

      const mockInstance: MockFitbitInstance = {
        parseCSVData: jest.fn().mockReturnValue(mockCsvData),
        importCSVData: jest.fn().mockRejectedValue(new Error("Fitbit API error")),
      };

      mockFitbitAPI.mockImplementation(
        () => mockInstance as unknown as FitbitAPI
      );

      const csvContent = `日付,体重(kg),体脂肪率(%)
2025/5/5,66.0,13.2`;

      const mockRequest = new Request(
        "http://localhost:3000/api/fitbit/import/csv",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvContent }),
        }
      );

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe("Failed to import CSV data: Fitbit API error");
    });
  });

  describe("POST /validate", () => {
    it("should successfully validate CSV data", async () => {
      const mockCsvData = [
        { date: "2025-05-05", weight: 66.0, bodyFat: 13.2 },
        { date: "2025-05-06", weight: 66.0, bodyFat: 12.6 },
      ];

      const mockInstance: MockFitbitInstance = {
        parseCSVData: jest.fn().mockReturnValue(mockCsvData),
        importCSVData: jest.fn(),
      };

      mockFitbitAPI.mockImplementation(
        () => mockInstance as unknown as FitbitAPI
      );

      const csvContent = `日付,体重(kg),体脂肪率(%)
2025/5/5,66.0,13.2
2025/5/6,66.0,12.6`;

      const mockRequest = new Request(
        "http://localhost:3000/api/fitbit/import/validate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvContent }),
        }
      );

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe("CSV validation successful. Found 2 valid records");
      expect(responseData.results).toEqual({
        success: 2,
        failed: 0,
        errors: []
      });

      expect(mockInstance.parseCSVData).toHaveBeenCalledWith(csvContent);
      expect(mockInstance.importCSVData).not.toHaveBeenCalled();
    });

    it("should handle validation errors", async () => {
      const mockInstance: MockFitbitInstance = {
        parseCSVData: jest.fn().mockImplementation(() => {
          throw new Error("Invalid date format at line 2. Expected YYYY/M/D format");
        }),
        importCSVData: jest.fn(),
      };

      mockFitbitAPI.mockImplementation(
        () => mockInstance as unknown as FitbitAPI
      );

      const csvContent = `日付,体重(kg),体脂肪率(%)
2025-05-05,66.0,13.2`;

      const mockRequest = new Request(
        "http://localhost:3000/api/fitbit/import/validate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvContent }),
        }
      );

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe("CSV validation failed: Invalid date format at line 2. Expected YYYY/M/D format");
    });

    it("should handle missing CSV content in validation", async () => {
      const mockRequest = new Request(
        "http://localhost:3000/api/fitbit/import/validate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe("CSV content is required");
    });
  });
});