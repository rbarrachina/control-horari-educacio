import type { UserConfig, DayData } from '@/types';
import { DEFAULT_USER_CONFIG } from './constants';

const USER_CONFIG_KEY = 'control-horari-config';
const DAYS_DATA_KEY = 'control-horari-days';

export function getUserConfig(): UserConfig {
  try {
    const stored = localStorage.getItem(USER_CONFIG_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading user config:', error);
  }
  return DEFAULT_USER_CONFIG;
}

export function saveUserConfig(config: UserConfig): void {
  try {
    localStorage.setItem(USER_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving user config:', error);
  }
}

export function getDaysData(): Record<string, DayData> {
  try {
    const stored = localStorage.getItem(DAYS_DATA_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading days data:', error);
  }
  return {};
}

export function saveDaysData(data: Record<string, DayData>): void {
  try {
    localStorage.setItem(DAYS_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving days data:', error);
  }
}

export function getDayData(date: string): DayData | null {
  const allDays = getDaysData();
  return allDays[date] || null;
}

export function saveDayData(dayData: DayData): void {
  const allDays = getDaysData();
  allDays[dayData.date] = dayData;
  saveDaysData(allDays);
}
