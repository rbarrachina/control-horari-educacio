import type { UserConfig, DayData, DayType } from '@/types';
import { DEFAULT_USER_CONFIG } from './constants';
import { getDayTypeForDate } from './timeCalculations';
import { parseISO } from 'date-fns';

const USER_CONFIG_KEY = 'control-horari-config';
const DAYS_DATA_KEY = 'control-horari-days';

export function getUserConfig(): UserConfig {
  try {
    const stored = localStorage.getItem(USER_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migrate old config without schedulePeriods
      if (!parsed.schedulePeriods) {
        parsed.schedulePeriods = DEFAULT_USER_CONFIG.schedulePeriods;
      }
      if (typeof parsed.calendarYear !== 'number') {
        parsed.calendarYear = DEFAULT_USER_CONFIG.calendarYear;
      }
      // Migrate old weeklyConfig with theoreticalHours
      if (parsed.weeklyConfig && 'theoreticalHours' in (parsed.weeklyConfig.monday || {})) {
        parsed.weeklyConfig = {
          monday: { dayType: parsed.weeklyConfig.monday?.dayType || 'presencial' },
          tuesday: { dayType: parsed.weeklyConfig.tuesday?.dayType || 'presencial' },
          wednesday: { dayType: parsed.weeklyConfig.wednesday?.dayType || 'presencial' },
          thursday: { dayType: parsed.weeklyConfig.thursday?.dayType || 'teletreball' },
          friday: { dayType: parsed.weeklyConfig.friday?.dayType || 'teletreball' },
        };
      }
      if (typeof parsed.usedFlexHours !== 'number') {
        parsed.usedFlexHours = DEFAULT_USER_CONFIG.usedFlexHours;
      }
      return parsed;
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

export function saveDaysData(data: Record<string, DayData | null | undefined>): void {
  try {
    const sanitized = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value != null)
    ) as Record<string, DayData>;
    localStorage.setItem(DAYS_DATA_KEY, JSON.stringify(sanitized));
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

type ExportDayData = Omit<DayData, 'startTime' | 'endTime' | 'startTime2' | 'endTime2' | 'dayType' | 'requestStatus'> & {
  startTime?: string | null;
  endTime?: string | null;
  startTime2?: string | null;
  endTime2?: string | null;
  dayType?: DayType;
  requestStatus?: DayData['requestStatus'];
};

export interface ExportData {
  config: UserConfig;
  daysData: Record<string, ExportDayData>;
  exportDate: string;
  version: string;
}

export function exportAllData(): ExportData {
  const daysData = getDaysData();
  const sanitizedDaysData = Object.fromEntries(
    Object.entries(daysData).map(([date, dayData]) => {
      const { theoreticalHours: _unused, dayType: _dayType, requestStatus, ...rest } = dayData as DayData & {
        theoreticalHours?: number;
      };
      const cleaned: ExportDayData = { ...rest };

      if (cleaned.startTime === null) delete cleaned.startTime;
      if (cleaned.endTime === null) delete cleaned.endTime;
      if (cleaned.startTime2 == null) delete cleaned.startTime2;
      if (cleaned.endTime2 == null) delete cleaned.endTime2;
      if (requestStatus != null) {
        cleaned.requestStatus = requestStatus;
      }

      return [date, cleaned];
    })
  );

  return {
    config: getUserConfig(),
    daysData: sanitizedDaysData,
    exportDate: new Date().toISOString(),
    version: '1.0',
  };
}

export function importAllData(data: ExportData): boolean {
  try {
    if (data.config && data.daysData) {
      saveUserConfig(data.config);
      const sanitizedDaysData = Object.fromEntries(
        Object.entries(data.daysData).map(([date, dayData]) => {
          const { theoreticalHours: _unused, ...rest } = dayData as DayData & { theoreticalHours?: number };
          const normalized: DayData = {
            ...rest,
            startTime: rest.startTime ?? null,
            endTime: rest.endTime ?? null,
            startTime2: rest.startTime2 ?? null,
            endTime2: rest.endTime2 ?? null,
            requestStatus: rest.requestStatus ?? null,
            dayType: rest.dayType ?? getDayTypeForDate(parseISO(date), data.config),
          };
          return [date, normalized];
        })
      ) as Record<string, DayData>;
      saveDaysData(sanitizedDaysData);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}

export function resetAllData(): void {
  localStorage.removeItem(USER_CONFIG_KEY);
  localStorage.removeItem(DAYS_DATA_KEY);
}
