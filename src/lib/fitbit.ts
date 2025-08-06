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

interface FitbitWeightLogResponse {
  weightLog: {
    logId: number;
    weight: number;
    date: string;
    time: string;
    source: string;
  };
}

interface FitbitBodyFatLogResponse {
  fatLog: {
    logId: number;
    fat: number;
    date: string;
    time: string;
    source: string;
  };
}

interface CSVWeightData {
  date: string;
  weight: number;
  bodyFat: number;
}

interface FitbitFoodLogData {
  foods: Array<{
    is_favorite: boolean;
    logDate: string;
    logId: number;
    logged_food: {
      access_level: string;
      amount: number;
      brand?: string;
      calories: number;
      foodId: number;
      locale?: string;
      meal_type_id: number;
      name: string;
      unit: {
        id: number;
        name: string;
        plural: string;
      };
      units?: number[];
    };
    nutritionalValues?: {
      calories: number;
      carbs: number;
      fat: number;
      fiber: number;
      protein: number;
      sodium: number;
    };
  }>;
  goals?: {
    calories: number;
  };
  summary: {
    calories: number;
    carbs: number;
    fat: number;
    fiber: number;
    protein: number;
    sodium: number;
    water: number;
  };
}

export interface FoodLogEntry {
  logId: number;
  mealTypeId: number;
  foodName: string;
  calories: number;
  amount: number;
  unit: string;
  brand?: string;
}

export interface DailyFoodLog {
  date: string;
  totalCalories: number;
  foodSummary: string;
  entries: FoodLogEntry[];
}

export class FitbitAPI {
  private accessToken: string;

  constructor() {
    this.accessToken = process.env.FITBIT_ACCESS_TOKEN!;
  }

  async getActivityData(
    date: string
  ): Promise<{ caloriesOut: number; steps: number }> {
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

  async getWeightTimeSeries(
    startDate: string,
    endDate: string
  ): Promise<Array<{ date: string; weight: number }>> {
    const response = await fetch(
      `https://api.fitbit.com/1/user/-/body/weight/date/${startDate}/${endDate}.json`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch weight time series: ${response.statusText}`
      );
    }

    const data: FitbitWeightTimeSeriesData = await response.json();

    return data["body-weight"]
      .map((item) => ({
        date: item.dateTime,
        weight: parseFloat(item.value) || 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getCaloriesTimeSeries(
    startDate: string,
    endDate: string
  ): Promise<Array<{ date: string; caloriesOut: number; caloriesIn: number }>> {
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
      ),
    ]);

    if (!activitiesResponse.ok) {
      throw new Error(
        `Failed to fetch activities time series: ${activitiesResponse.statusText}`
      );
    }

    if (!nutritionResponse.ok) {
      throw new Error(
        `Failed to fetch nutrition time series: ${nutritionResponse.statusText}`
      );
    }

    const [activitiesData, nutritionData] = await Promise.all([
      activitiesResponse.json() as Promise<FitbitTimeSeriesData>,
      nutritionResponse.json() as Promise<FitbitNutritionTimeSeriesData>,
    ]);

    const activitiesMap = new Map(
      activitiesData["activities-calories"].map((item) => [
        item.dateTime,
        parseInt(item.value) || 0,
      ])
    );

    const nutritionMap = new Map(
      nutritionData["foods-log-caloriesIn"].map((item) => [
        item.dateTime,
        parseInt(item.value) || 0,
      ])
    );

    const allDates = new Set([
      ...activitiesData["activities-calories"].map((item) => item.dateTime),
      ...nutritionData["foods-log-caloriesIn"].map((item) => item.dateTime),
    ]);

    return Array.from(allDates)
      .sort()
      .map((date) => ({
        date,
        caloriesOut: activitiesMap.get(date) || 0,
        caloriesIn: nutritionMap.get(date) || 0,
      }));
  }

  async getCaloriesAndWeightTimeSeries(
    startDate: string,
    endDate: string
  ): Promise<
    Array<{
      date: string;
      caloriesOut: number;
      caloriesIn: number;
      weight?: number;
    }>
  > {
    const [caloriesData, weightData] = await Promise.all([
      this.getCaloriesTimeSeries(startDate, endDate),
      this.getWeightTimeSeries(startDate, endDate),
    ]);

    const weightMap = new Map(
      weightData.map((item) => [item.date, item.weight])
    );

    return caloriesData.map((item) => ({
      ...item,
      weight: weightMap.get(item.date),
    }));
  }

  async getBodyFatTimeSeries(
    startDate: string,
    endDate: string
  ): Promise<Array<{ date: string; bodyFat: number }>> {
    const response = await fetch(
      `https://api.fitbit.com/1/user/-/body/fat/date/${startDate}/${endDate}.json`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch body fat time series: ${response.statusText}`
      );
    }

    const data: FitbitBodyFatData = await response.json();

    return data["body-fat"]
      .map((item) => ({
        date: item.dateTime,
        bodyFat: parseFloat(item.value) || 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getWeightAndBodyFatTimeSeries(
    startDate: string,
    endDate: string
  ): Promise<Array<{ date: string; weight?: number; bodyFat?: number }>> {
    const [weightData, bodyFatData] = await Promise.all([
      this.getWeightTimeSeries(startDate, endDate),
      this.getBodyFatTimeSeries(startDate, endDate),
    ]);

    const weightMap = new Map(
      weightData.map((item) => [item.date, item.weight])
    );

    const bodyFatMap = new Map(
      bodyFatData.map((item) => [item.date, item.bodyFat])
    );

    const allDates = new Set([
      ...weightData.map((item) => item.date),
      ...bodyFatData.map((item) => item.date),
    ]);

    return Array.from(allDates)
      .sort()
      .map((date) => ({
        date,
        weight: weightMap.get(date),
        bodyFat: bodyFatMap.get(date),
      }));
  }

  async logWeight(
    weight: number,
    date: string
  ): Promise<FitbitWeightLogResponse> {
    const response = await fetch(
      "https://api.fitbit.com/1/user/-/body/log/weight.json",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          weight: weight.toString(),
          date: date,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to log weight: ${response.statusText}`);
    }

    return await response.json();
  }

  async logBodyFat(
    fat: number,
    date: string
  ): Promise<FitbitBodyFatLogResponse> {
    const response = await fetch(
      "https://api.fitbit.com/1/user/-/body/log/fat.json",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          fat: fat.toString(),
          date: date,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to log body fat: ${response.statusText}`);
    }

    return await response.json();
  }

  parseCSVData(csvContent: string): CSVWeightData[] {
    const lines = csvContent.trim().split("\n");

    if (lines.length < 2) {
      throw new Error(
        "CSV file must contain at least a header and one data row"
      );
    }

    const header = lines[0];
    const expectedHeaders = ["日付", "体重(kg)", "体脂肪率(%)"];

    if (!expectedHeaders.every((h) => header.includes(h))) {
      throw new Error(
        "Invalid CSV format. Expected headers: 日付, 体重(kg), 体脂肪率(%)"
      );
    }

    const dataLines = lines.slice(1);
    const parsedData: CSVWeightData[] = [];

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim();
      if (!line) continue;

      const columns = line.split(",");
      if (columns.length !== 3) {
        throw new Error(
          `Invalid CSV format at line ${i + 2}. Expected 3 columns, got ${
            columns.length
          }`
        );
      }

      const [dateStr, weightStr, bodyFatStr] = columns.map((col) => col.trim());

      // Parse date from YYYY/M/D format to YYYY-MM-DD format
      const dateParts = dateStr.split("/");
      if (dateParts.length !== 3) {
        throw new Error(
          `Invalid date format at line ${i + 2}. Expected YYYY/M/D format`
        );
      }

      const year = dateParts[0];
      const month = dateParts[1].padStart(2, "0");
      const day = dateParts[2].padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      const weight = parseFloat(weightStr);
      const bodyFat = parseFloat(bodyFatStr);

      if (isNaN(weight) || weight <= 0) {
        throw new Error(`Invalid weight value at line ${i + 2}: ${weightStr}`);
      }

      if (isNaN(bodyFat) || bodyFat <= 0) {
        throw new Error(
          `Invalid body fat value at line ${i + 2}: ${bodyFatStr}`
        );
      }

      parsedData.push({
        date: formattedDate,
        weight,
        bodyFat,
      });
    }

    // Remove duplicates (keep the last entry for each date)
    const uniqueData = new Map<string, CSVWeightData>();
    parsedData.forEach((data) => {
      uniqueData.set(data.date, data);
    });

    return Array.from(uniqueData.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }

  async importCSVData(
    csvData: CSVWeightData[]
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const data of csvData) {
      try {
        await Promise.all([
          this.logWeight(data.weight, data.date),
          this.logBodyFat(data.bodyFat, data.date),
        ]);
        results.success++;
      } catch (error) {
        results.failed++;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.errors.push(`${data.date}: ${errorMessage}`);
      }
    }

    return results;
  }

  async getFoodLog(date: string): Promise<DailyFoodLog> {
    const response = await fetch(
      `https://api.fitbit.com/1/user/-/foods/log/date/${date}.json`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch food log: ${response.statusText}`);
    }

    const data: FitbitFoodLogData = await response.json();

    // Convert food entries to our format with safety checks
    const entries: FoodLogEntry[] = (data.foods || [])
      .filter((food) => food && food.logged_food) // Safety check for undefined objects
      .map((food) => ({
        logId: food.logId,
        mealTypeId: food.logged_food.meal_type_id,
        foodName: food.logged_food.name,
        calories: food.logged_food.calories,
        amount: food.logged_food.amount,
        unit: food.logged_food.unit?.name || "unit",
        brand: food.logged_food.brand || undefined,
      }))
      .sort((a, b) => {
        // Sort by mealTypeId first, then by logId
        if (a.mealTypeId !== b.mealTypeId) {
          return a.mealTypeId - b.mealTypeId;
        }
        return a.logId - b.logId;
      });

    // Create food summary (comma-separated food names)
    const foodNames = entries.map((entry) => entry.foodName);
    const foodSummary = foodNames.join(", ");

    return {
      date,
      totalCalories: data.summary?.calories || 0,
      foodSummary: foodSummary || "食品データなし",
      entries,
    };
  }

  getMealTypeLabel(mealTypeId: number): string {
    const mealTypes: Record<number, string> = {
      1: "朝食",
      2: "モーニング・スナック",
      3: "昼食",
      4: "午後のおやつ",
      5: "夕食",
      6: "夕方のおやつ",
      7: "いつでも",
    };
    return mealTypes[mealTypeId] || "その他";
  }
}
