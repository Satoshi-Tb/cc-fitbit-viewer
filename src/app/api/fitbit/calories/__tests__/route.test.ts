import { GET } from "../route";
import { FitbitAPI } from "@/lib/fitbit";

// Mock the FitbitAPI
jest.mock("@/lib/fitbit");

interface MockFitbitInstance {
  getCaloriesTimeSeries: jest.Mock;
  getCaloriesAndWeightTimeSeries: jest.Mock;
}

describe("/api/fitbit/calories", () => {
  const mockFitbitAPI = FitbitAPI as jest.MockedClass<typeof FitbitAPI>;

  beforeEach(() => {
    mockFitbitAPI.mockClear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should return calories data for week period", async () => {
    const mockData = [
      { date: "2024-06-24", caloriesOut: 2500, caloriesIn: 2000 },
      { date: "2024-06-25", caloriesOut: 2300, caloriesIn: 1800 },
      { date: "2024-06-30", caloriesOut: 2700, caloriesIn: 2200 },
    ];

    const mockInstance: MockFitbitInstance = {
      getCaloriesTimeSeries: jest.fn().mockResolvedValue(mockData),
      getCaloriesAndWeightTimeSeries: jest.fn().mockResolvedValue(mockData),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/calories?period=week&endDate=2024-06-30"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.data).toEqual(mockData);

    expect(mockInstance.getCaloriesAndWeightTimeSeries).toHaveBeenCalledWith(
      "2024-06-24",
      "2024-06-30"
    );
  });

  it("should return calories data for month period", async () => {
    const mockData = [
      { date: "2024-06-01", caloriesOut: 2500, caloriesIn: 2000 },
      { date: "2024-06-30", caloriesOut: 2700, caloriesIn: 2200 },
    ];

    const mockInstance: MockFitbitInstance = {
      getCaloriesTimeSeries: jest.fn().mockResolvedValue(mockData),
      getCaloriesAndWeightTimeSeries: jest.fn().mockResolvedValue(mockData),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/calories?period=month&endDate=2024-06-30"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.data).toEqual(mockData);

    expect(mockInstance.getCaloriesAndWeightTimeSeries).toHaveBeenCalledWith(
      "2024-06-01",
      "2024-06-30"
    );
  });

  it("should handle API errors gracefully", async () => {
    const mockInstance: MockFitbitInstance = {
      getCaloriesTimeSeries: jest
        .fn()
        .mockRejectedValue(new Error("Failed to fetch activities time series: Unauthorized")),
      getCaloriesAndWeightTimeSeries: jest
        .fn()
        .mockRejectedValue(new Error("Failed to fetch activities time series: Unauthorized")),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/calories"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain("Failed to fetch activities time series: Unauthorized");
    expect(responseData.data).toEqual([]);
  });

  it("should use default week period when no period specified", async () => {
    const mockData = [
      { date: "2024-01-01", caloriesOut: 2500, caloriesIn: 2000 },
    ];

    const mockInstance: MockFitbitInstance = {
      getCaloriesTimeSeries: jest.fn().mockResolvedValue(mockData),
      getCaloriesAndWeightTimeSeries: jest.fn().mockResolvedValue(mockData),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/calories"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.data).toEqual(mockData);

    // Verify that getCaloriesAndWeightTimeSeries was called with date range for week (7 days)
    const [startDate, endDate] = mockInstance.getCaloriesAndWeightTimeSeries.mock.calls[0];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    expect(daysDiff).toBe(6); // 7 days - 1
  });

  it("should return empty data when no calories found", async () => {
    const mockInstance: MockFitbitInstance = {
      getCaloriesTimeSeries: jest.fn().mockResolvedValue([]),
      getCaloriesAndWeightTimeSeries: jest.fn().mockResolvedValue([]),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/calories"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.data).toEqual([]);
  });

  it("should handle unknown errors", async () => {
    const mockInstance: MockFitbitInstance = {
      getCaloriesTimeSeries: jest.fn().mockRejectedValue("Unknown error type"),
      getCaloriesAndWeightTimeSeries: jest.fn().mockRejectedValue("Unknown error type"),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/calories"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe("Unknown error");
  });
});
