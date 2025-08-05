"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';  
import { useAtom } from 'jotai';
import { baseDateAtom } from '@/store/atoms';
import { DateSelector } from './DateSelector';

export function Navigation() {
  const [baseDate] = useAtom(baseDateAtom);
  const pathname = usePathname();

  return (
    <div className="mb-6">
      {/* ナビゲーションメニュー */}
      <nav className="flex gap-4 mb-4">
        <Link 
          href="/" 
          className={`px-4 py-2 rounded-lg transition-colors ${
            pathname === '/' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ダッシュボード
        </Link>
        <Link 
          href="/calories" 
          className={`px-4 py-2 rounded-lg transition-colors ${
            pathname === '/calories' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          トレンド分析
        </Link>
      </nav>
      
      {/* 基準日セレクター */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-6">
          <DateSelector />
          <div className="text-sm text-gray-600">
            現在の基準日: 
            <span className="ml-2 font-medium text-gray-900">
              {baseDate.toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}