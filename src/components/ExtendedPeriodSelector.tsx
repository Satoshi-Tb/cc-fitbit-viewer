"use client";

import React from "react";

interface ExtendedPeriodSelectorProps {
  period: string;
  onPeriodChange: (period: string) => void;
}

export default function ExtendedPeriodSelector({ period, onPeriodChange }: ExtendedPeriodSelectorProps) {
  const periods = [
    { value: "1w", label: "1週間" },
    { value: "1m", label: "1ヵ月" },
    { value: "3m", label: "3ヵ月" },
    { value: "6m", label: "半年" },
    { value: "1y", label: "1年" },
  ];

  return (
    <div className="flex gap-2">
      {periods.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onPeriodChange(value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            period === value
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}