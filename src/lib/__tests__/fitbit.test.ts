import { FitbitAPI } from '../fitbit';

// Mock global fetch
global.fetch = jest.fn();

describe('FitbitAPI', () => {
  let fitbitAPI: FitbitAPI;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    fitbitAPI = new FitbitAPI();
    mockFetch.mockClear();
    process.env.FITBIT_ACCESS_TOKEN = 'test-token';
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getActivityData', () => {
    it('should return activity data with caloriesOut and steps', async () => {
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

      const result = await fitbitAPI.getActivityData('2024-01-01');

      expect(result).toEqual({
        caloriesOut: 2500,
        steps: 10000,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.fitbit.com/1/user/-/activities/date/2024-01-01.json',
        {
          headers: {
            Authorization: 'Bearer test-token',
          },
        }
      );
    });

    it('should handle missing summary data', async () => {
      const mockResponse = {};

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getActivityData('2024-01-01');

      expect(result).toEqual({
        caloriesOut: 0,
        steps: 0,
      });
    });

    it('should throw error when API call fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      } as Response);

      await expect(fitbitAPI.getActivityData('2024-01-01')).rejects.toThrow(
        'Failed to fetch activity data: Unauthorized'
      );
    });
  });

  describe('getNutritionData', () => {
    it('should return nutrition calories', async () => {
      const mockResponse = {
        summary: {
          calories: 2000,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getNutritionData('2024-01-01');

      expect(result).toBe(2000);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.fitbit.com/1/user/-/foods/log/date/2024-01-01.json',
        {
          headers: {
            Authorization: 'Bearer test-token',
          },
        }
      );
    });

    it('should return 0 when no calories data', async () => {
      const mockResponse = {};

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getNutritionData('2024-01-01');

      expect(result).toBe(0);
    });

    it('should throw error when API call fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      } as Response);

      await expect(fitbitAPI.getNutritionData('2024-01-01')).rejects.toThrow(
        'Failed to fetch nutrition data: Bad Request'
      );
    });
  });

  describe('getWeightData', () => {
    it('should return weight from body-weight array', async () => {
      const mockResponse = {
        'body-weight': [
          {
            dateTime: '2024-01-01',
            value: '70.5',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getWeightData('2024-01-01');

      expect(result).toBe(70.5);
    });

    it('should return weight from weight array when body-weight is empty', async () => {
      const mockResponse = {
        'body-weight': [],
        weight: [
          {
            date: '2024-01-01',
            weight: 68.2,
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getWeightData('2024-01-01');

      expect(result).toBe(68.2);
    });

    it('should return 0 when no weight data available', async () => {
      const mockResponse = {
        'body-weight': [],
        weight: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getWeightData('2024-01-01');

      expect(result).toBe(0);
    });

    it('should return 0 when response is empty object', async () => {
      const mockResponse = {};

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fitbitAPI.getWeightData('2024-01-01');

      expect(result).toBe(0);
    });

    it('should throw error when API call fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(fitbitAPI.getWeightData('2024-01-01')).rejects.toThrow(
        'Failed to fetch weight data: Internal Server Error'
      );
    });
  });
});