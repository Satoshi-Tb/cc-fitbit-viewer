'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CalorieChartProps } from '@/types';

export default function CalorieChart({ data, period }: CalorieChartProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (period === 'week') {
      return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  const formatTooltipLabel = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  const hasWeightData = data.some(item => item.weight !== undefined && item.weight > 0);

  const chartData = data.map(item => ({
    ...item,
    formattedDate: formatDate(item.date)
  }));

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: hasWeightData ? 80 : 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="formattedDate"
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#ccc' }}
            tickLine={{ stroke: '#ccc' }}
          />
          <YAxis 
            yAxisId="calories"
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#ccc' }}
            tickLine={{ stroke: '#ccc' }}
            label={{ value: 'カロリー (kcal)', angle: -90, position: 'insideLeft' }}
          />
          {hasWeightData && (
            <YAxis 
              yAxisId="weight"
              orientation="right"
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#ccc' }}
              tickLine={{ stroke: '#ccc' }}
              label={{ value: '体重 (kg)', angle: 90, position: 'insideRight' }}
            />
          )}
          <Tooltip 
            labelFormatter={(value, payload) => {
              if (payload && payload.length > 0) {
                return formatTooltipLabel(payload[0].payload.date);
              }
              return value;
            }}
            formatter={(value: number, name: string) => {
              if (name === 'weight') {
                return [`${value} kg`, '体重'];
              }
              return [
                `${value.toLocaleString()} kcal`,
                name === 'caloriesOut' ? '消費カロリー' : '摂取カロリー'
              ];
            }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend 
            formatter={(value) => {
              if (value === 'weight') return '体重';
              return value === 'caloriesOut' ? '消費カロリー' : '摂取カロリー';
            }}
          />
          <Line 
            yAxisId="calories"
            type="monotone" 
            dataKey="caloriesOut" 
            stroke="#ef4444" 
            strokeWidth={3}
            dot={{ fill: '#ef4444', r: 4 }}
            activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
          />
          <Line 
            yAxisId="calories"
            type="monotone" 
            dataKey="caloriesIn" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
          {hasWeightData && (
            <Line 
              yAxisId="weight"
              type="monotone" 
              dataKey="weight" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 3 }}
              activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2 }}
              connectNulls={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}