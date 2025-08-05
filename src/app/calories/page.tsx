"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import CalorieChart from "@/components/CalorieChart";
import WeightTrendChart from "@/components/WeightTrendChart";
import PeriodSelector from "@/components/PeriodSelector";
import ExtendedPeriodSelector from "@/components/ExtendedPeriodSelector";
import CSVImport from "@/components/CSVImport";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useCalorieData } from "@/hooks/useCalorieData";
import { useWeightData } from "@/hooks/useWeightData";

export default function CaloriesPage() {
  const [activeTab, setActiveTab] = useState<"calories" | "weight" | "import">(
    "calories"
  );
  const [caloriePeriod, setCaloriePeriod] = useState<"week" | "month">("week");
  const [weightPeriod, setWeightPeriod] = useState<string>("1m");

  const {
    data: calorieData,
    error: calorieError,
    isLoading: calorieLoading,
    mutate: calorieRetry,
  } = useCalorieData(caloriePeriod);
  const {
    data: weightData,
    error: weightError,
    isLoading: weightLoading,
    mutate: weightRetry,
  } = useWeightData(weightPeriod);

  const handleImportComplete = (result: { success: boolean }) => {
    if (result.success) {
      // Refresh weight data after successful import
      weightRetry();
    }
  };

  const currentError = activeTab === "calories" ? calorieError : weightError;
  const currentLoading =
    activeTab === "calories" ? calorieLoading : weightLoading;

  if (currentError) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <Navigation />
          <h1 className="text-3xl font-bold mb-6">トレンド分析</h1>
          <ErrorBoundary
            error={currentError}
            retry={() =>
              activeTab === "calories" ? calorieRetry() : weightRetry()
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <Navigation />
        <h1 className="text-3xl font-bold mb-6">トレンド分析</h1>

        <div className="mb-6">
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("calories")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "calories"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              カロリートレンド
            </button>
            <button
              onClick={() => setActiveTab("weight")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "weight"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              体重トレンド
            </button>
            <button
              onClick={() => setActiveTab("import")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "import"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              disabled={true} // 外部公開のため、いったん取り込み機能は無効化
            >
              CSV取り込み
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab !== "import" && (
            <div className="mb-6">
              {activeTab === "calories" ? (
                <PeriodSelector
                  period={caloriePeriod}
                  onPeriodChange={setCaloriePeriod}
                />
              ) : (
                <ExtendedPeriodSelector
                  period={weightPeriod}
                  onPeriodChange={setWeightPeriod}
                />
              )}
            </div>
          )}

          {activeTab === "import" ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                体重・体脂肪データ取り込み
              </h2>
              <CSVImport onImportComplete={handleImportComplete} />
            </div>
          ) : currentLoading ? (
            <SkeletonLoader />
          ) : (
            <div>
              {activeTab === "calories" ? (
                <div>
                  <CalorieChart data={calorieData} period={caloriePeriod} />

                  {calorieData.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">
                          平均消費カロリー
                        </h3>
                        <p className="text-2xl font-bold text-red-600">
                          {(() => {
                            const validData = calorieData.filter(
                              (item) => item.caloriesOut > 0
                            );
                            return validData.length > 0
                              ? Math.round(
                                  validData.reduce(
                                    (sum, item) => sum + item.caloriesOut,
                                    0
                                  ) / validData.length
                                ).toLocaleString()
                              : "0";
                          })()}{" "}
                          kcal
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">
                          平均摂取カロリー
                        </h3>
                        <p className="text-2xl font-bold text-blue-600">
                          {(() => {
                            const validData = calorieData.filter(
                              (item) => item.caloriesIn > 0
                            );
                            return validData.length > 0
                              ? Math.round(
                                  validData.reduce(
                                    (sum, item) => sum + item.caloriesIn,
                                    0
                                  ) / validData.length
                                ).toLocaleString()
                              : "0";
                          })()}{" "}
                          kcal
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">
                          平均カロリー差
                        </h3>
                        <p
                          className={`text-2xl font-bold ${(() => {
                            const validData = calorieData.filter(
                              (item) =>
                                item.caloriesOut > 0 && item.caloriesIn > 0
                            );
                            const avgDiff =
                              validData.length > 0
                                ? validData.reduce(
                                    (sum, item) =>
                                      sum +
                                      (item.caloriesOut - item.caloriesIn),
                                    0
                                  ) / validData.length
                                : 0;
                            return avgDiff > 0
                              ? "text-green-600"
                              : "text-orange-600";
                          })()}`}
                        >
                          {(() => {
                            const validData = calorieData.filter(
                              (item) =>
                                item.caloriesOut > 0 && item.caloriesIn > 0
                            );
                            return validData.length > 0
                              ? Math.round(
                                  validData.reduce(
                                    (sum, item) =>
                                      sum +
                                      (item.caloriesOut - item.caloriesIn),
                                    0
                                  ) / validData.length
                                ).toLocaleString()
                              : "0";
                          })()}{" "}
                          kcal
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <WeightTrendChart data={weightData} period={weightPeriod} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
