import { ErrorBoundaryProps } from '@/types';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg">
      <h2 className="text-lg font-semibold text-red-800 mb-2">エラーが発生しました</h2>
      <p className="text-red-600 mb-4">{error.message}</p>
      <button
        onClick={retry}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        再試行
      </button>
    </div>
  );
}