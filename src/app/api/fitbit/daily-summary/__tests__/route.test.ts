import { GET } from "../route";
import { FitbitAPI } from "@/lib/fitbit";

// Mock the FitbitAPI
jest.mock("@/lib/fitbit");

interface MockFitbitInstance {
  getActivityData: jest.Mock;
  getNutritionData: jest.Mock;
  getWeightData: jest.Mock;
}

describe("/api/fitbit/daily-summary", () => {
  const mockFitbitAPI = FitbitAPI as jest.MockedClass<typeof FitbitAPI>;

  beforeEach(() => {
    mockFitbitAPI.mockClear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should return daily summary data successfully", async () => {
    const mockActivityData = { caloriesOut: 2500, steps: 10000 };
    const mockNutritionData = 2000;
    const mockWeightData = 70.5;

    const mockInstance: MockFitbitInstance = {
      getActivityData: jest.fn().mockResolvedValue(mockActivityData),
      getNutritionData: jest.fn().mockResolvedValue(mockNutritionData),
      getWeightData: jest.fn().mockResolvedValue(mockWeightData),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/daily-summary"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.data).toEqual({
      caloriesBurned: 2500,
      caloriesConsumed: 2000,
      weight: 70.5,
      steps: 10000,
      date: expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
    });

    expect(mockInstance.getActivityData).toHaveBeenCalledWith(
      expect.stringMatching(/\d{4}-\d{2}-\d{2}/)
    );
    expect(mockInstance.getNutritionData).toHaveBeenCalledWith(
      expect.stringMatching(/\d{4}-\d{2}-\d{2}/)
    );
    expect(mockInstance.getWeightData).toHaveBeenCalledWith(
      expect.stringMatching(/\d{4}-\d{2}-\d{2}/)
    );
  });

  it("should handle API errors gracefully", async () => {
    const mockInstance: MockFitbitInstance = {
      getActivityData: jest
        .fn()
        .mockRejectedValue(new Error("API rate limit exceeded")),
      getNutritionData: jest.fn().mockResolvedValue(0),
      getWeightData: jest.fn().mockResolvedValue(0),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/daily-summary"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain("API rate limit exceeded");
    expect(responseData.data).toEqual({});
  });

  it("should handle partial data when some APIs fail", async () => {
    const mockActivityData = { caloriesOut: 2500, steps: 10000 };

    const mockInstance: MockFitbitInstance = {
      getActivityData: jest.fn().mockResolvedValue(mockActivityData),
      getNutritionData: jest
        .fn()
        .mockRejectedValue(new Error("Nutrition API error")),
      getWeightData: jest.fn().mockResolvedValue(70.5),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/daily-summary"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain("Nutrition API error");
  });

  it("should handle unknown errors", async () => {
    const mockInstance: MockFitbitInstance = {
      getActivityData: jest.fn().mockRejectedValue("Unknown error"),
      getNutritionData: jest.fn().mockResolvedValue(0),
      getWeightData: jest.fn().mockResolvedValue(0),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/daily-summary"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain("Unknown error");
  });

  it("should use today's date in ISO format", async () => {
    const mockActivityData = { caloriesOut: 2500, steps: 10000 };
    const mockNutritionData = 2000;
    const mockWeightData = 70.5;

    const mockInstance: MockFitbitInstance = {
      getActivityData: jest.fn().mockResolvedValue(mockActivityData),
      getNutritionData: jest.fn().mockResolvedValue(mockNutritionData),
      getWeightData: jest.fn().mockResolvedValue(mockWeightData),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    // Mock Date to ensure consistent testing
    const mockDate = new Date("2024-01-15T10:30:00.000Z");
    jest
      .spyOn(global, "Date")
      .mockImplementation(() => mockDate as unknown as Date);
    Date.prototype.toISOString = jest.fn(() => "2024-01-15T10:30:00.000Z");

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/daily-summary"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(responseData.data.date).toBe("2024-01-15");

    expect(mockInstance.getActivityData).toHaveBeenCalledWith("2024-01-15");
    expect(mockInstance.getNutritionData).toHaveBeenCalledWith("2024-01-15");
    expect(mockInstance.getWeightData).toHaveBeenCalledWith("2024-01-15");

    // Restore Date
    jest.restoreAllMocks();
  });
});
