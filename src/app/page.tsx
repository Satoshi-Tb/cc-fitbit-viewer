import { Dashboard } from '@/components/Dashboard';
import { Navigation } from '@/components/Navigation';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <Navigation />
        <Dashboard />
      </div>
    </div>
  );
}
