'use client';

import { useState, useRef, useEffect } from 'react';
import { DailyFoodLog, FoodLogEntry } from '@/lib/fitbit';
import { FitbitAPI } from '@/lib/fitbit';

interface FoodLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodLog: DailyFoodLog | null;
}

interface MealGroup {
  mealTypeId: number;
  mealLabel: string;
  entries: FoodLogEntry[];
  subtotal: number;
}

function getMealGroups(entries: FoodLogEntry[]): MealGroup[] {
  const fitbitAPI = new FitbitAPI();
  const groups = new Map<number, FoodLogEntry[]>();

  // Group entries by mealTypeId
  entries.forEach(entry => {
    if (!groups.has(entry.mealTypeId)) {
      groups.set(entry.mealTypeId, []);
    }
    groups.get(entry.mealTypeId)!.push(entry);
  });

  // Convert to MealGroup array and sort by mealTypeId
  const mealGroups: MealGroup[] = Array.from(groups.entries())
    .map(([mealTypeId, groupEntries]) => ({
      mealTypeId,
      mealLabel: fitbitAPI.getMealTypeLabel(mealTypeId),
      entries: groupEntries.sort((a, b) => a.logId - b.logId), // Sort by logId within meal
      subtotal: groupEntries.reduce((sum, entry) => sum + entry.calories, 0)
    }))
    .sort((a, b) => a.mealTypeId - b.mealTypeId);

  return mealGroups;
}

export function FoodLogModal({ isOpen, onClose, foodLog }: FoodLogModalProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset position when modal opens
  useEffect(() => {
    if (isOpen) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Constrain to viewport
      const modal = modalRef.current;
      if (modal) {
        const rect = modal.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        
        setPosition({
          x: Math.min(Math.max(newX, -rect.width / 2), maxX + rect.width / 2),
          y: Math.min(Math.max(newY, 0), maxY)
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  if (!isOpen || !foodLog) return null;

  const mealGroups = getMealGroups(foodLog.entries);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden shadow-2xl"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b border-gray-200 select-none"
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <h2 className="text-xl font-semibold text-gray-900 pointer-events-none">
            食品詳細 - {foodLog.date}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors pointer-events-auto"
            style={{ cursor: 'pointer' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {mealGroups.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              この日の食品データはありません
            </div>
          ) : (
            <div className="space-y-6">
              {mealGroups.map((group) => (
                <div key={group.mealTypeId} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center justify-between">
                    <span>{group.mealLabel}</span>
                    <span className="text-sm font-semibold text-blue-600">
                      小計: {group.subtotal.toLocaleString()} kcal
                    </span>
                  </h3>
                  
                  <div className="space-y-2">
                    {group.entries.map((entry, index) => (
                      <div key={`${entry.logId}-${index}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {entry.foodName}
                            {entry.brand && (
                              <span className="text-gray-500 ml-1">({entry.brand})</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {entry.amount} {entry.unit}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900 ml-4">
                          {entry.calories.toLocaleString()} kcal
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-lg font-semibold text-gray-900">
            1日の合計: {foodLog.totalCalories.toLocaleString()} kcal
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}