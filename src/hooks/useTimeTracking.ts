import { useState, useEffect, useCallback } from 'react';
import type { UserConfig, DayData } from '@/types';
import { getUserConfig, saveUserConfig, getDaysData, saveDayData, saveDaysData } from '@/lib/storage';
import { DEFAULT_USER_CONFIG } from '@/lib/constants';

export function useTimeTracking() {
  const [config, setConfig] = useState<UserConfig>(DEFAULT_USER_CONFIG);
  const [daysData, setDaysData] = useState<Record<string, DayData>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadedConfig = getUserConfig();
    const loadedDays = getDaysData();
    setConfig(loadedConfig);
    setDaysData(loadedDays);
    setIsLoading(false);
  }, []);

  const updateConfig = useCallback((newConfig: UserConfig) => {
    setConfig(newConfig);
    saveUserConfig(newConfig);
  }, []);

  const updateDayData = useCallback((dayData: DayData) => {
    setDaysData(prev => {
      const updated = { ...prev, [dayData.date]: dayData };
      saveDayData(dayData);
      return updated;
    });
  }, []);

  const updateFlexibility = useCallback((hours: number) => {
    setConfig(prev => {
      const updated = { ...prev, flexibilityHours: Math.min(25, Math.max(0, hours)) };
      saveUserConfig(updated);
      return updated;
    });
  }, []);

  const addVacationDay = useCallback(() => {
    setConfig(prev => {
      const updated = { ...prev, usedVacationDays: prev.usedVacationDays + 1 };
      saveUserConfig(updated);
      return updated;
    });
  }, []);

  const removeVacationDay = useCallback(() => {
    setConfig(prev => {
      const updated = { ...prev, usedVacationDays: Math.max(0, prev.usedVacationDays - 1) };
      saveUserConfig(updated);
      return updated;
    });
  }, []);

  const addAPHours = useCallback((hours: number) => {
    setConfig(prev => {
      const updated = { ...prev, usedAPHours: prev.usedAPHours + hours };
      saveUserConfig(updated);
      return updated;
    });
  }, []);

  const toggleHoliday = useCallback((date: string) => {
    setConfig(prev => {
      const holidays = prev.holidays.includes(date)
        ? prev.holidays.filter(h => h !== date)
        : [...prev.holidays, date];
      const updated = { ...prev, holidays };
      saveUserConfig(updated);
      return updated;
    });
  }, []);

  return {
    config,
    daysData,
    isLoading,
    updateConfig,
    updateDayData,
    updateFlexibility,
    addVacationDay,
    removeVacationDay,
    addAPHours,
    toggleHoliday,
  };
}
