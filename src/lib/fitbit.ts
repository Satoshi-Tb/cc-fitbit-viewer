interface FitbitActivityData {
  'activities-calories': Array<{
    dateTime: string;
    value: string;
  }>;
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
  'body-weight': Array<{
    dateTime: string;
    value: string;
  }>;
}

export class FitbitAPI {
  private accessToken: string;

  constructor() {
    this.accessToken = process.env.FITBIT_ACCESS_TOKEN!;
  }

  async getActivityData(date: string): Promise<number> {
    const response = await fetch(
      `https://api.fitbit.com/1/user/-/activities/calories/date/${date}/1d.json`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch activity data: ${response.statusText}`);
    }

    const data: FitbitActivityData = await response.json();
    return parseInt(data['activities-calories'][0]?.value || '0');
  }

  async getNutritionData(date: string): Promise<number> {
    const response = await fetch(
      `https://api.fitbit.com/1/user/-/foods/log/date/${date}.json`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
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
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch weight data: ${response.statusText}`);
    }

    const data: FitbitWeightData = await response.json();
    return parseFloat(data['body-weight'][0]?.value || '0');
  }
}