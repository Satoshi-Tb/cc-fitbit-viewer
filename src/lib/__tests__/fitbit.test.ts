import { FitbitAPI } from "../fitbit";

// Mock global fetch
global.fetch = jest.fn();

describe("FitbitAPI", () => {
  let fitbitAPI: FitbitAPI;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    fitbitAPI = new FitbitAPI();
    mockFetch.mockClear();
    process.env.FITBIT_ACCESS_TOKEN = "mock-access-token";
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getActivityData", () => {
    it("should return activity data with caloriesOut and steps", async () => {
      const mockResponse = {
        summary: {
          caloriesOut: 2500,
          steps: 10000,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getActivityData("2024-01-01");

      expect(result).toEqual({
        caloriesOut: 2500,
        steps: 10000,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.fitbit.com/1/user/-/activities/date/2024-01-01.json",
        {
          headers: {
            Authorization: "Bearer mock-access-token",
          },
        }
      );
    });

    it("should handle missing summary data", async () => {
      const mockResponse = {};

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getActivityData("2024-01-01");

      expect(result).toEqual({
        caloriesOut: 0,
        steps: 0,
      });
    });

    it("should throw error when API call fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Unauthorized",
      } as Response);

      await expect(fitbitAPI.getActivityData("2024-01-01")).rejects.toThrow(
        "Failed to fetch activity data: Unauthorized"
      );
    });
  });

  describe("getNutritionData", () => {
    it("should return nutrition calories", async () => {
      const mockResponse = {
        summary: {
          calories: 2000,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getNutritionData("2024-01-01");

      expect(result).toBe(2000);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.fitbit.com/1/user/-/foods/log/date/2024-01-01.json",
        {
          headers: {
            Authorization: "Bearer mock-access-token",
          },
        }
      );
    });

    it("should return 0 when no calories data", async () => {
      const mockResponse = {};

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getNutritionData("2024-01-01");

      expect(result).toBe(0);
    });

    it("should throw error when API call fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Bad Request",
      } as Response);

      await expect(fitbitAPI.getNutritionData("2024-01-01")).rejects.toThrow(
        "Failed to fetch nutrition data: Bad Request"
      );
    });
  });

  describe("getWeightData", () => {
    it("should return weight from body-weight array", async () => {
      const mockResponse = {
        "body-weight": [
          {
            dateTime: "2024-01-01",
            value: "70.5",
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getWeightData("2024-01-01");

      expect(result).toBe(70.5);
    });

    it("should return weight from weight array when body-weight is empty", async () => {
      const mockResponse = {
        "body-weight": [],
        weight: [
          {
            date: "2024-01-01",
            weight: 68.2,
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getWeightData("2024-01-01");

      expect(result).toBe(68.2);
    });

    it("should return 0 when no weight data available", async () => {
      const mockResponse = {
        "body-weight": [],
        weight: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getWeightData("2024-01-01");

      expect(result).toBe(0);
    });

    it("should return 0 when response is empty object", async () => {
      const mockResponse = {};

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getWeightData("2024-01-01");

      expect(result).toBe(0);
    });

    it("should throw error when API call fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Internal Server Error",
      } as Response);

      await expect(fitbitAPI.getWeightData("2024-01-01")).rejects.toThrow(
        "Failed to fetch weight data: Internal Server Error"
      );
    });
  });

  describe("getCaloriesTimeSeries", () => {
    it("should return time series data for calories out and in", async () => {
      const mockActivitiesResponse = {
        "activities-calories": [
          { dateTime: "2024-01-01", value: "2500" },
          { dateTime: "2024-01-02", value: "2300" },
          { dateTime: "2024-01-03", value: "2700" },
        ],
      };

      const mockNutritionResponse = {
        "foods-log-caloriesIn": [
          { dateTime: "2024-01-01", value: "2000" },
          { dateTime: "2024-01-02", value: "1800" },
          { dateTime: "2024-01-03", value: "2200" },
        ],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockActivitiesResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockNutritionResponse,
        } as Response);

      const result = await fitbitAPI.getCaloriesTimeSeries("2024-01-01", "2024-01-03");

      expect(result).toEqual([
        { date: "2024-01-01", caloriesOut: 2500, caloriesIn: 2000 },
        { date: "2024-01-02", caloriesOut: 2300, caloriesIn: 1800 },
        { date: "2024-01-03", caloriesOut: 2700, caloriesIn: 2200 },
      ]);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        "https://api.fitbit.com/1/user/-/activities/calories/date/2024-01-01/2024-01-03.json",
        {
          headers: {
            Authorization: "Bearer mock-access-token",
          },
        }
      );
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        "https://api.fitbit.com/1/user/-/foods/log/caloriesIn/date/2024-01-01/2024-01-03.json",
        {
          headers: {
            Authorization: "Bearer mock-access-token",
          },
        }
      );
    });

    it("should handle missing data points", async () => {
      const mockActivitiesResponse = {
        "activities-calories": [
          { dateTime: "2024-01-01", value: "2500" },
          { dateTime: "2024-01-03", value: "2700" },
        ],
      };

      const mockNutritionResponse = {
        "foods-log-caloriesIn": [
          { dateTime: "2024-01-02", value: "1800" },
          { dateTime: "2024-01-03", value: "2200" },
        ],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockActivitiesResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockNutritionResponse,
        } as Response);

      const result = await fitbitAPI.getCaloriesTimeSeries("2024-01-01", "2024-01-03");

      expect(result).toEqual([
        { date: "2024-01-01", caloriesOut: 2500, caloriesIn: 0 },
        { date: "2024-01-02", caloriesOut: 0, caloriesIn: 1800 },
        { date: "2024-01-03", caloriesOut: 2700, caloriesIn: 2200 },
      ]);
    });

    it("should handle invalid values by converting to 0", async () => {
      const mockActivitiesResponse = {
        "activities-calories": [
          { dateTime: "2024-01-01", value: "invalid" },
          { dateTime: "2024-01-02", value: "" },
        ],
      };

      const mockNutritionResponse = {
        "foods-log-caloriesIn": [
          { dateTime: "2024-01-01", value: "abc" },
          { dateTime: "2024-01-02", value: "1800" },
        ],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockActivitiesResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockNutritionResponse,
        } as Response);

      const result = await fitbitAPI.getCaloriesTimeSeries("2024-01-01", "2024-01-02");

      expect(result).toEqual([
        { date: "2024-01-01", caloriesOut: 0, caloriesIn: 0 },
        { date: "2024-01-02", caloriesOut: 0, caloriesIn: 1800 },
      ]);
    });

    it("should throw error when activities API call fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Unauthorized",
      } as Response);

      await expect(
        fitbitAPI.getCaloriesTimeSeries("2024-01-01", "2024-01-03")
      ).rejects.toThrow("Failed to fetch activities time series: Unauthorized");
    });

    it("should throw error when nutrition API call fails", async () => {
      const mockActivitiesResponse = {
        "activities-calories": [
          { dateTime: "2024-01-01", value: "2500" },
        ],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockActivitiesResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          statusText: "Bad Request",
        } as Response);

      await expect(
        fitbitAPI.getCaloriesTimeSeries("2024-01-01", "2024-01-03")
      ).rejects.toThrow("Failed to fetch nutrition time series: Bad Request");
    });

    it("should return empty array when both APIs return empty data", async () => {
      const mockActivitiesResponse = {
        "activities-calories": [],
      };

      const mockNutritionResponse = {
        "foods-log-caloriesIn": [],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockActivitiesResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockNutritionResponse,
        } as Response);

      const result = await fitbitAPI.getCaloriesTimeSeries("2024-01-01", "2024-01-03");

      expect(result).toEqual([]);
    });
  });

  describe("getWeightTimeSeries", () => {
    it("should return weight time series data", async () => {
      const mockResponse = {
        "body-weight": [
          { dateTime: "2024-01-01", value: "70.5" },
          { dateTime: "2024-01-02", value: "70.2" },
          { dateTime: "2024-01-03", value: "69.8" },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getWeightTimeSeries("2024-01-01", "2024-01-03");

      expect(result).toEqual([
        { date: "2024-01-01", weight: 70.5 },
        { date: "2024-01-02", weight: 70.2 },
        { date: "2024-01-03", weight: 69.8 },
      ]);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.fitbit.com/1/user/-/body/weight/date/2024-01-01/2024-01-03.json",
        {
          headers: {
            Authorization: "Bearer mock-access-token",
          },
        }
      );
    });

    it("should handle invalid weight values by converting to 0", async () => {
      const mockResponse = {
        "body-weight": [
          { dateTime: "2024-01-01", value: "invalid" },
          { dateTime: "2024-01-02", value: "" },
          { dateTime: "2024-01-03", value: "69.8" },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getWeightTimeSeries("2024-01-01", "2024-01-03");

      expect(result).toEqual([
        { date: "2024-01-01", weight: 0 },
        { date: "2024-01-02", weight: 0 },
        { date: "2024-01-03", weight: 69.8 },
      ]);
    });

    it("should return empty array when no weight data available", async () => {
      const mockResponse = {
        "body-weight": [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getWeightTimeSeries("2024-01-01", "2024-01-03");

      expect(result).toEqual([]);
    });

    it("should sort results by date", async () => {
      const mockResponse = {
        "body-weight": [
          { dateTime: "2024-01-03", value: "69.8" },
          { dateTime: "2024-01-01", value: "70.5" },
          { dateTime: "2024-01-02", value: "70.2" },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getWeightTimeSeries("2024-01-01", "2024-01-03");

      expect(result).toEqual([
        { date: "2024-01-01", weight: 70.5 },
        { date: "2024-01-02", weight: 70.2 },
        { date: "2024-01-03", weight: 69.8 },
      ]);
    });

    it("should throw error when API call fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Unauthorized",
      } as Response);

      await expect(
        fitbitAPI.getWeightTimeSeries("2024-01-01", "2024-01-03")
      ).rejects.toThrow("Failed to fetch weight time series: Unauthorized");
    });
  });

  describe("getCaloriesAndWeightTimeSeries", () => {
    it("should return combined calories and weight data", async () => {
      const mockActivitiesResponse = {
        "activities-calories": [
          { dateTime: "2024-01-01", value: "2500" },
          { dateTime: "2024-01-02", value: "2300" },
        ],
      };

      const mockNutritionResponse = {
        "foods-log-caloriesIn": [
          { dateTime: "2024-01-01", value: "2000" },
          { dateTime: "2024-01-02", value: "1800" },
        ],
      };

      const mockWeightResponse = {
        "body-weight": [
          { dateTime: "2024-01-01", value: "70.5" },
          { dateTime: "2024-01-02", value: "70.2" },
        ],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockActivitiesResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockNutritionResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWeightResponse,
        } as Response);

      const result = await fitbitAPI.getCaloriesAndWeightTimeSeries("2024-01-01", "2024-01-02");

      expect(result).toEqual([
        { date: "2024-01-01", caloriesOut: 2500, caloriesIn: 2000, weight: 70.5 },
        { date: "2024-01-02", caloriesOut: 2300, caloriesIn: 1800, weight: 70.2 },
      ]);

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("should handle missing weight data", async () => {
      const mockActivitiesResponse = {
        "activities-calories": [
          { dateTime: "2024-01-01", value: "2500" },
          { dateTime: "2024-01-02", value: "2300" },
        ],
      };

      const mockNutritionResponse = {
        "foods-log-caloriesIn": [
          { dateTime: "2024-01-01", value: "2000" },
          { dateTime: "2024-01-02", value: "1800" },
        ],
      };

      const mockWeightResponse = {
        "body-weight": [
          { dateTime: "2024-01-01", value: "70.5" },
        ],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockActivitiesResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockNutritionResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWeightResponse,
        } as Response);

      const result = await fitbitAPI.getCaloriesAndWeightTimeSeries("2024-01-01", "2024-01-02");

      expect(result).toEqual([
        { date: "2024-01-01", caloriesOut: 2500, caloriesIn: 2000, weight: 70.5 },
        { date: "2024-01-02", caloriesOut: 2300, caloriesIn: 1800, weight: undefined },
      ]);
    });

    it("should handle empty weight data", async () => {
      const mockActivitiesResponse = {
        "activities-calories": [
          { dateTime: "2024-01-01", value: "2500" },
        ],
      };

      const mockNutritionResponse = {
        "foods-log-caloriesIn": [
          { dateTime: "2024-01-01", value: "2000" },
        ],
      };

      const mockWeightResponse = {
        "body-weight": [],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockActivitiesResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockNutritionResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWeightResponse,
        } as Response);

      const result = await fitbitAPI.getCaloriesAndWeightTimeSeries("2024-01-01", "2024-01-01");

      expect(result).toEqual([
        { date: "2024-01-01", caloriesOut: 2500, caloriesIn: 2000, weight: undefined },
      ]);
    });
  });

  describe("getBodyFatTimeSeries", () => {
    it("should return body fat time series data", async () => {
      const mockResponse = {
        "body-fat": [
          { dateTime: "2024-01-01", value: "15.5" },
          { dateTime: "2024-01-02", value: "15.2" },
          { dateTime: "2024-01-03", value: "14.8" },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getBodyFatTimeSeries("2024-01-01", "2024-01-03");

      expect(result).toEqual([
        { date: "2024-01-01", bodyFat: 15.5 },
        { date: "2024-01-02", bodyFat: 15.2 },
        { date: "2024-01-03", bodyFat: 14.8 },
      ]);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.fitbit.com/1/user/-/body/fat/date/2024-01-01/2024-01-03.json",
        {
          headers: {
            Authorization: "Bearer mock-access-token",
          },
        }
      );
    });

    it("should handle invalid body fat values by converting to 0", async () => {
      const mockResponse = {
        "body-fat": [
          { dateTime: "2024-01-01", value: "invalid" },
          { dateTime: "2024-01-02", value: "" },
          { dateTime: "2024-01-03", value: "14.8" },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getBodyFatTimeSeries("2024-01-01", "2024-01-03");

      expect(result).toEqual([
        { date: "2024-01-01", bodyFat: 0 },
        { date: "2024-01-02", bodyFat: 0 },
        { date: "2024-01-03", bodyFat: 14.8 },
      ]);
    });

    it("should return empty array when no body fat data available", async () => {
      const mockResponse = {
        "body-fat": [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getBodyFatTimeSeries("2024-01-01", "2024-01-03");

      expect(result).toEqual([]);
    });

    it("should sort results by date", async () => {
      const mockResponse = {
        "body-fat": [
          { dateTime: "2024-01-03", value: "14.8" },
          { dateTime: "2024-01-01", value: "15.5" },
          { dateTime: "2024-01-02", value: "15.2" },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getBodyFatTimeSeries("2024-01-01", "2024-01-03");

      expect(result).toEqual([
        { date: "2024-01-01", bodyFat: 15.5 },
        { date: "2024-01-02", bodyFat: 15.2 },
        { date: "2024-01-03", bodyFat: 14.8 },
      ]);
    });

    it("should throw error when API call fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Unauthorized",
      } as Response);

      await expect(
        fitbitAPI.getBodyFatTimeSeries("2024-01-01", "2024-01-03")
      ).rejects.toThrow("Failed to fetch body fat time series: Unauthorized");
    });
  });

  describe("getWeightAndBodyFatTimeSeries", () => {
    it("should return combined weight and body fat data", async () => {
      const mockWeightResponse = {
        "body-weight": [
          { dateTime: "2024-01-01", value: "70.5" },
          { dateTime: "2024-01-02", value: "70.2" },
        ],
      };

      const mockBodyFatResponse = {
        "body-fat": [
          { dateTime: "2024-01-01", value: "15.5" },
          { dateTime: "2024-01-02", value: "15.2" },
        ],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWeightResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBodyFatResponse,
        } as Response);

      const result = await fitbitAPI.getWeightAndBodyFatTimeSeries("2024-01-01", "2024-01-02");

      expect(result).toEqual([
        { date: "2024-01-01", weight: 70.5, bodyFat: 15.5 },
        { date: "2024-01-02", weight: 70.2, bodyFat: 15.2 },
      ]);

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should handle missing weight data", async () => {
      const mockWeightResponse = {
        "body-weight": [
          { dateTime: "2024-01-01", value: "70.5" },
        ],
      };

      const mockBodyFatResponse = {
        "body-fat": [
          { dateTime: "2024-01-01", value: "15.5" },
          { dateTime: "2024-01-02", value: "15.2" },
        ],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWeightResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBodyFatResponse,
        } as Response);

      const result = await fitbitAPI.getWeightAndBodyFatTimeSeries("2024-01-01", "2024-01-02");

      expect(result).toEqual([
        { date: "2024-01-01", weight: 70.5, bodyFat: 15.5 },
        { date: "2024-01-02", weight: undefined, bodyFat: 15.2 },
      ]);
    });

    it("should handle missing body fat data", async () => {
      const mockWeightResponse = {
        "body-weight": [
          { dateTime: "2024-01-01", value: "70.5" },
          { dateTime: "2024-01-02", value: "70.2" },
        ],
      };

      const mockBodyFatResponse = {
        "body-fat": [
          { dateTime: "2024-01-01", value: "15.5" },
        ],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWeightResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBodyFatResponse,
        } as Response);

      const result = await fitbitAPI.getWeightAndBodyFatTimeSeries("2024-01-01", "2024-01-02");

      expect(result).toEqual([
        { date: "2024-01-01", weight: 70.5, bodyFat: 15.5 },
        { date: "2024-01-02", weight: 70.2, bodyFat: undefined },
      ]);
    });

    it("should handle empty data", async () => {
      const mockWeightResponse = {
        "body-weight": [],
      };

      const mockBodyFatResponse = {
        "body-fat": [],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWeightResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBodyFatResponse,
        } as Response);

      const result = await fitbitAPI.getWeightAndBodyFatTimeSeries("2024-01-01", "2024-01-02");

      expect(result).toEqual([]);
    });

    it("should sort results by date", async () => {
      const mockWeightResponse = {
        "body-weight": [
          { dateTime: "2024-01-03", value: "69.8" },
          { dateTime: "2024-01-01", value: "70.5" },
        ],
      };

      const mockBodyFatResponse = {
        "body-fat": [
          { dateTime: "2024-01-02", value: "15.2" },
          { dateTime: "2024-01-01", value: "15.5" },
        ],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWeightResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBodyFatResponse,
        } as Response);

      const result = await fitbitAPI.getWeightAndBodyFatTimeSeries("2024-01-01", "2024-01-03");

      expect(result).toEqual([
        { date: "2024-01-01", weight: 70.5, bodyFat: 15.5 },
        { date: "2024-01-02", weight: undefined, bodyFat: 15.2 },
        { date: "2024-01-03", weight: 69.8, bodyFat: undefined },
      ]);
    });
  });
});
