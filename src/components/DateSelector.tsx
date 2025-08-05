"use client";

import { useAtom } from 'jotai';
import { baseDateAtom } from '@/store/atoms';

export function DateSelector() {
  const [baseDate, setBaseDate] = useAtom(baseDateAtom);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(event.target.value);
    setBaseDate(selectedDate);
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="base-date" className="text-sm font-medium text-gray-700">
        基準日:
      </label>
      <input
        id="base-date"
        type="date"
        value={formatDateForInput(baseDate)}
        onChange={handleDateChange}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      />
    </div>
  );
}