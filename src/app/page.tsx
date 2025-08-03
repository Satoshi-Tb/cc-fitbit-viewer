import Link from 'next/link';
import { Dashboard } from '@/components/Dashboard';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <nav className="flex gap-4">
            <Link 
              href="/" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ダッシュボード
            </Link>
            <Link 
              href="/calories" 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              カロリートレンド
            </Link>
          </nav>
        </div>
        <Dashboard />
      </div>
    </div>
  );
}
