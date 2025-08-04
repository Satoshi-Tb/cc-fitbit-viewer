import { GET } from "../route";
import { FitbitAPI } from "@/lib/fitbit";

// Mock the FitbitAPI
jest.mock("@/lib/fitbit");

interface MockFitbitInstance {
  getWeightAndBodyFatTimeSeries: jest.Mock;
}

describe("/api/fitbit/weight", () => {
  const mockFitbitAPI = FitbitAPI as jest.MockedClass<typeof FitbitAPI>;

  beforeEach(() => {
    mockFitbitAPI.mockClear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should return weight data for 1w period", async () => {
    const mockData = [
      { date: "2024-01-01", weight: 70.5, bodyFat: 15.5 },
      { date: "2024-01-02", weight: 70.2, bodyFat: 15.2 },
      { date: "2024-01-07", weight: 69.8, bodyFat: 14.8 },
    ];

    const mockInstance: MockFitbitInstance = {
      getWeightAndBodyFatTimeSeries: jest.fn().mockResolvedValue(mockData),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/weight?period=1w"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.data).toEqual(mockData);
    expect(responseData.period).toBe("1w");
    expect(responseData.dateRange).toBeDefined();
    expect(responseData.dateRange.start).toBeDefined();
    expect(responseData.dateRange.end).toBeDefined();

    // Verify that the method was called with correct date range (7 days)
    const [startDate, endDate] = mockInstance.getWeightAndBodyFatTimeSeries.mock.calls[0];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    expect(daysDiff).toBe(7);
  });

  it("should return weight data for 1m period", async () => {
    const mockData = [
      { date: "2024-01-01", weight: 70.5, bodyFat: 15.5 },
      { date: "2024-01-31", weight: 69.8, bodyFat: 14.8 },
    ];

    const mockInstance: MockFitbitInstance = {
      getWeightAndBodyFatTimeSeries: jest.fn().mockResolvedValue(mockData),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/weight?period=1m"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.data).toEqual(mockData);
    expect(responseData.period).toBe("1m");

    expect(mockInstance.getWeightAndBodyFatTimeSeries).toHaveBeenCalledTimes(1);
  });

  it("should return weight data for 3m period", async () => {
    const mockData = [
      { date: "2024-01-01", weight: 72.0, bodyFat: 16.0 },
      { date: "2024-03-31", weight: 69.5, bodyFat: 14.5 },
    ];

    const mockInstance: MockFitbitInstance = {
      getWeightAndBodyFatTimeSeries: jest.fn().mockResolvedValue(mockData),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/weight?period=3m"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.data).toEqual(mockData);
    expect(responseData.period).toBe("3m");
  });

  it("should return weight data for 6m period", async () => {
    const mockData = [
      { date: "2023-07-01", weight: 75.0, bodyFat: 18.0 },
      { date: "2024-01-01", weight: 70.0, bodyFat: 15.0 },
    ];

    const mockInstance: MockFitbitInstance = {
      getWeightAndBodyFatTimeSeries: jest.fn().mockResolvedValue(mockData),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/weight?period=6m"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.data).toEqual(mockData);
    expect(responseData.period).toBe("6m");
  });

  it("should return weight data for 1y period", async () => {
    const mockData = [
      { date: "2023-01-01", weight: 80.0, bodyFat: 20.0 },
      { date: "2024-01-01", weight: 70.0, bodyFat: 15.0 },
    ];

    const mockInstance: MockFitbitInstance = {
      getWeightAndBodyFatTimeSeries: jest.fn().mockResolvedValue(mockData),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/weight?period=1y"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.data).toEqual(mockData);
    expect(responseData.period).toBe("1y");
  });

  it("should use default 1m period when no period specified", async () => {
    const mockData = [
      { date: "2024-01-01", weight: 70.5, bodyFat: 15.5 },
    ];

    const mockInstance: MockFitbitInstance = {
      getWeightAndBodyFatTimeSeries: jest.fn().mockResolvedValue(mockData),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/weight"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.period).toBe("1m");
    expect(responseData.data).toEqual(mockData);
  });

  it("should use default 1m period for invalid period", async () => {
    const mockData = [
      { date: "2024-01-01", weight: 70.5, bodyFat: 15.5 },
    ];

    const mockInstance: MockFitbitInstance = {
      getWeightAndBodyFatTimeSeries: jest.fn().mockResolvedValue(mockData),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/weight?period=invalid"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.period).toBe("invalid");
    expect(responseData.data).toEqual(mockData);

    // Verify that default 1m period was used in date calculation
    const [startDate, endDate] = mockInstance.getWeightAndBodyFatTimeSeries.mock.calls[0];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    expect(monthsDiff).toBe(1);
  });

  it("should return empty data when no weight data found", async () => {
    const mockInstance: MockFitbitInstance = {
      getWeightAndBodyFatTimeSeries: jest.fn().mockResolvedValue([]),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/weight"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.data).toEqual([]);
  });

  it("should handle API errors gracefully", async () => {
    const mockInstance: MockFitbitInstance = {
      getWeightAndBodyFatTimeSeries: jest
        .fn()
        .mockRejectedValue(new Error("Failed to fetch weight time series: Unauthorized")),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/weight"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.error).toBe("Failed to fetch weight data");
  });

  it("should handle weight data with missing body fat", async () => {
    const mockData = [
      { date: "2024-01-01", weight: 70.5, bodyFat: undefined },
      { date: "2024-01-02", weight: 70.2, bodyFat: 15.2 },
    ];

    const mockInstance: MockFitbitInstance = {
      getWeightAndBodyFatTimeSeries: jest.fn().mockResolvedValue(mockData),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/weight?period=1w"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.data).toEqual(mockData);
  });

  it("should handle weight data with missing weight", async () => {
    const mockData = [
      { date: "2024-01-01", weight: undefined, bodyFat: 15.5 },
      { date: "2024-01-02", weight: 70.2, bodyFat: 15.2 },
    ];

    const mockInstance: MockFitbitInstance = {
      getWeightAndBodyFatTimeSeries: jest.fn().mockResolvedValue(mockData),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/weight?period=1w"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.data).toEqual(mockData);
  });

  it("should handle unknown errors", async () => {
    const mockInstance: MockFitbitInstance = {
      getWeightAndBodyFatTimeSeries: jest.fn().mockRejectedValue("Unknown error type"),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/weight"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.error).toBe("Failed to fetch weight data");
  });

  it("should return correct date format in response", async () => {
    const mockData = [
      { date: "2024-01-01", weight: 70.5, bodyFat: 15.5 },
    ];

    const mockInstance: MockFitbitInstance = {
      getWeightAndBodyFatTimeSeries: jest.fn().mockResolvedValue(mockData),
    };

    mockFitbitAPI.mockImplementation(
      () => mockInstance as unknown as FitbitAPI
    );

    const mockRequest = new Request(
      "http://localhost:3000/api/fitbit/weight?period=1w"
    );
    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.dateRange.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(responseData.dateRange.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});