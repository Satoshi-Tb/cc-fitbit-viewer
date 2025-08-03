interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
}

export function MetricCard({ title, value, unit, icon }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="flex items-baseline">
        <p className="text-2xl font-bold text-gray-900">
          {value.toLocaleString()}
        </p>
        <span className="ml-2 text-sm text-gray-500">{unit}</span>
      </div>
    </div>
  );
}