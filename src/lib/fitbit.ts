interface FitbitActivityData {
  summary: {
    caloriesOut: number;
    steps: number;
  };
}

interface FitbitNutritionData {
  foods: Array<{
    loggedFood: {
      calories: number;
    };
  }>;
  summary: {
    calories: number;
  };
}

interface FitbitWeightData {
  "body-weight": Array<{
    dateTime: string;
    value: string;
  }>;
  weight?: Array<{
    date: string;
    weight: number;
  }>;
}

interface FitbitWeightTimeSeriesData {
  "body-weight": Array<{
    dateTime: string;
    value: string;
  }>;
}

interface FitbitBodyFatData {
  "body-fat": Array<{
    dateTime: string;
    value: string;
  }>;
}

interface FitbitTimeSeriesData {
  "activities-calories": Array<{
    dateTime: string;
    value: string;
  }>;
}

interface FitbitNutritionTimeSeriesData {
  "foods-log-caloriesIn": Array<{
    dateTime: string;
    value: string;
  }>;
}

export class FitbitAPI {
  private accessToken: string;

  constructor() {
    this.accessToken = process.env.FITBIT_ACCESS_TOKEN!;
  }

  async getActivityData(date: string): Promise<{ caloriesOut: number; steps: number }> {
    const response = await fetch(
      `https://api.fitbit.com/1/user/-/activities/date/${date}.json`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch activity data: ${response.statusText}`);
    }

    const data: FitbitActivityData = await response.json();
    return {
      caloriesOut: data.summary?.caloriesOut || 0,
      steps: data.summary?.steps || 0,
    };
  }

  async getNutritionData(date: string): Promise<number> {
    const response = await fetch(
      `https://api.fitbit.com/1/user/-/foods/log/date/${date}.json`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch nutrition data: ${response.statusText}`);
    }

    const data: FitbitNutritionData = await response.json();
    return data.summary?.calories || 0;
  }

  async getWeightData(date: string): Promise<number> {
    const response = await fetch(
      `https://api.fitbit.com/1/user/-/body/log/weight/date/${date}.json`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch weight data: ${response.statusText}`);
    }

    const data: FitbitWeightData = await response.json();
    
    // Check both possible response formats
    if (data["body-weight"] && data["body-weight"].length > 0) {
      return parseFloat(data["body-weight"][0].value || "0");
    }
    
    if (data.weight && data.weight.length > 0) {
      return data.weight[0].weight || 0;
    }
    
    return 0;
  }

  async getWeightTimeSeries(startDate: string, endDate: string): Promise<Array<{ date: string; weight: number }>> {
    const response = await fetch(
      `https://api.fitbit.com/1/user/-/body/weight/date/${startDate}/${endDate}.json`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch weight time series: ${response.statusText}`);
    }

    const data: FitbitWeightTimeSeriesData = await response.json();

    return data["body-weight"].map(item => ({
      date: item.dateTime,
      weight: parseFloat(item.value) || 0
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getCaloriesTimeSeries(startDate: string, endDate: string): Promise<Array<{ date: string; caloriesOut: number; caloriesIn: number }>> {
    const [activitiesResponse, nutritionResponse] = await Promise.all([
      fetch(
        `https://api.fitbit.com/1/user/-/activities/calories/date/${startDate}/${endDate}.json`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      ),
      fetch(
        `https://api.fitbit.com/1/user/-/foods/log/caloriesIn/date/${startDate}/${endDate}.json`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      )
    ]);

    if (!activitiesResponse.ok) {
      throw new Error(`Failed to fetch activities time series: ${activitiesResponse.statusText}`);
    }

    if (!nutritionResponse.ok) {
      throw new Error(`Failed to fetch nutrition time series: ${nutritionResponse.statusText}`);
    }

    const [activitiesData, nutritionData] = await Promise.all([
      activitiesResponse.json() as Promise<FitbitTimeSeriesData>,
      nutritionResponse.json() as Promise<FitbitNutritionTimeSeriesData>
    ]);

    const activitiesMap = new Map(
      activitiesData["activities-calories"].map(item => [
        item.dateTime,
        parseInt(item.value) || 0
      ])
    );

    const nutritionMap = new Map(
      nutritionData["foods-log-caloriesIn"].map(item => [
        item.dateTime,
        parseInt(item.value) || 0
      ])
    );

    const allDates = new Set([
      ...activitiesData["activities-calories"].map(item => item.dateTime),
      ...nutritionData["foods-log-caloriesIn"].map(item => item.dateTime)
    ]);

    return Array.from(allDates)
      .sort()
      .map(date => ({
        date,
        caloriesOut: activitiesMap.get(date) || 0,
        caloriesIn: nutritionMap.get(date) || 0
      }));
  }

  async getCaloriesAndWeightTimeSeries(startDate: string, endDate: string): Promise<Array<{ date: string; caloriesOut: number; caloriesIn: number; weight?: number }>> {
    const [caloriesData, weightData] = await Promise.all([
      this.getCaloriesTimeSeries(startDate, endDate),
      this.getWeightTimeSeries(startDate, endDate)
    ]);

    const weightMap = new Map(
      weightData.map(item => [item.date, item.weight])
    );

    return caloriesData.map(item => ({
      ...item,
      weight: weightMap.get(item.date)
    }));
  }

  async getBodyFatTimeSeries(startDate: string, endDate: string): Promise<Array<{ date: string; bodyFat: number }>> {
    const response = await fetch(
      `https://api.fitbit.com/1/user/-/body/fat/date/${startDate}/${endDate}.json`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch body fat time series: ${response.statusText}`);
    }

    const data: FitbitBodyFatData = await response.json();

    return data["body-fat"].map(item => ({
      date: item.dateTime,
      bodyFat: parseFloat(item.value) || 0
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getWeightAndBodyFatTimeSeries(startDate: string, endDate: string): Promise<Array<{ date: string; weight?: number; bodyFat?: number }>> {
    const [weightData, bodyFatData] = await Promise.all([
      this.getWeightTimeSeries(startDate, endDate),
      this.getBodyFatTimeSeries(startDate, endDate)
    ]);

    const weightMap = new Map(
      weightData.map(item => [item.date, item.weight])
    );

    const bodyFatMap = new Map(
      bodyFatData.map(item => [item.date, item.bodyFat])
    );

    const allDates = new Set([
      ...weightData.map(item => item.date),
      ...bodyFatData.map(item => item.date)
    ]);

    return Array.from(allDates)
      .sort()
      .map(date => ({
        date,
        weight: weightMap.get(date),
        bodyFat: bodyFatMap.get(date)
      }));
  }
}
