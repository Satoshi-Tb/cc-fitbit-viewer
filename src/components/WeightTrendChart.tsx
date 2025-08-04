"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface WeightData {
  date: string;
  weight?: number;
  bodyFat?: number;
}

interface WeightTrendChartProps {
  data: WeightData[];
  period: string;
}

interface StatsProps {
  data: WeightData[];
}

const Statistics: React.FC<StatsProps> = ({ data }) => {
  const weights = data.map(d => d.weight).filter((w): w is number => w !== undefined);
  const bodyFats = data.map(d => d.bodyFat).filter((bf): bf is number => bf !== undefined);

  const weightStats = weights.length > 0 ? {
    avg: (weights.reduce((sum, w) => sum + w, 0) / weights.length).toFixed(1),
    max: Math.max(...weights).toFixed(1),
    min: Math.min(...weights).toFixed(1),
  } : null;

  const bodyFatStats = bodyFats.length > 0 ? {
    avg: (bodyFats.reduce((sum, bf) => sum + bf, 0) / bodyFats.length).toFixed(1),
    max: Math.max(...bodyFats).toFixed(1),
    min: Math.min(...bodyFats).toFixed(1),
  } : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {weightStats && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">体重統計</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">平均:</span>
              <span className="font-medium">{weightStats.avg} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">最大:</span>
              <span className="font-medium">{weightStats.max} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">最小:</span>
              <span className="font-medium">{weightStats.min} kg</span>
            </div>
          </div>
        </div>
      )}
      {bodyFatStats && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">体脂肪率統計</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">平均:</span>
              <span className="font-medium">{bodyFatStats.avg}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">最大:</span>
              <span className="font-medium">{bodyFatStats.max}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">最小:</span>
              <span className="font-medium">{bodyFatStats.min}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function WeightTrendChart({ data }: WeightTrendChartProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const hasWeightData = data.some(d => d.weight !== undefined);
  const hasBodyFatData = data.some(d => d.bodyFat !== undefined);

  if (!hasWeightData && !hasBodyFatData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">選択した期間に体重・体脂肪率のデータがありません</p>
      </div>
    );
  }

  return (
    <div>
      <Statistics data={data} />
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            体重・体脂肪率トレンド
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="weight"
                orientation="left"
                domain={['dataMin - 1', 'dataMax + 1']}
                tick={{ fontSize: 12 }}
                label={{ value: '体重 (kg)', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="bodyFat"
                orientation="right"
                domain={['dataMin - 1', 'dataMax + 1']}
                tick={{ fontSize: 12 }}
                label={{ value: '体脂肪率 (%)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}${name === '体重' ? ' kg' : '%'}`,
                  name
                ]}
                labelFormatter={(label) => `日付: ${formatDate(label)}`}
              />
              <Legend />
              {hasWeightData && (
                <Line
                  yAxisId="weight"
                  type="monotone"
                  dataKey="weight"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="体重"
                  connectNulls={false}
                />
              )}
              {hasBodyFatData && (
                <Line
                  yAxisId="bodyFat"
                  type="monotone"
                  dataKey="bodyFat"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="体脂肪率"
                  connectNulls={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}