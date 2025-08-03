import { atom } from 'jotai';
import { DailySummary } from '@/types';

export const trendPeriodAtom = atom<'week' | 'month' | 'year'>('week');

export const dailySummaryAtom = atom<DailySummary | null>(null);

export const isLoadingAtom = atom<boolean>(false);

export const errorAtom = atom<string | null>(null);