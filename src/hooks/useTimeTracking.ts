import { useState, useEffect, useCallback, useRef } from 'react';
import type { UserConfig, DayData } from '@/types';
import { getUserConfig, saveUserConfig, getDaysData, saveDayData } from '@/lib/storage';
import { DEFAULT_USER_CONFIG } from '@/lib/constants';
import { calculateWorkedHours, getTheoreticalHoursForDate, calculateWeeklySummary } from '@/lib/timeCalculations';
import { startOfWeek } from 'date-fns';

export function useTimeTracking() {
  const [config, setConfig] = useState<UserConfig>(DEFAULT_USER_CONFIG);
  const [daysData, setDaysData] = useState<Record<string, DayData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const previousDaysDataRef = useRef<Record<string, DayData>>({});

  useEffect(() => {
    const loadedConfig = getUserConfig();
    const loadedDays = getDaysData();
    setConfig(loadedConfig);
    setDaysData(loadedDays);
    previousDaysDataRef.current = loadedDays;
    setIsLoading(false);
  }, []);

  const updateConfig = useCallback((newConfig: UserConfig) => {
    setConfig(newConfig);
    saveUserConfig(newConfig);
  }, []);

  const updateDayData = useCallback((dayData: DayData) => {
    const previousDayData = previousDaysDataRef.current[dayData.date];
    
    setDaysData(prev => {
      const updated = { ...prev, [dayData.date]: dayData };
      saveDayData(dayData);
      previousDaysDataRef.current = updated;
      return updated;
    });

    // Handle vacation/AP approval changes
    setConfig(prev => {
      let updatedConfig = { ...prev };
      
      // Check if vacation status changed to approved
      if (dayData.dayStatus === 'vacances' && dayData.requestStatus === 'aprovat') {
        // Only add if wasn't already approved
        const wasApproved = previousDayData?.dayStatus === 'vacances' && previousDayData?.requestStatus === 'aprovat';
        if (!wasApproved) {
          updatedConfig.usedVacationDays = Math.min(updatedConfig.totalVacationDays, updatedConfig.usedVacationDays + 1);
        }
      }
      
      // If vacation was approved but now it's not vacation or not approved, restore the day
      if (previousDayData?.dayStatus === 'vacances' && previousDayData?.requestStatus === 'aprovat') {
        if (dayData.dayStatus !== 'vacances' || dayData.requestStatus !== 'aprovat') {
          updatedConfig.usedVacationDays = Math.max(0, updatedConfig.usedVacationDays - 1);
        }
      }
      
      // Check if AP status changed to approved
      if (dayData.dayStatus === 'assumpte_propi' && dayData.requestStatus === 'aprovat') {
        const wasAPApproved = previousDayData?.dayStatus === 'assumpte_propi' && previousDayData?.requestStatus === 'aprovat';
        const previousAPHours = wasAPApproved ? (previousDayData?.apHours || 0) : 0;
        const newAPHours = dayData.apHours || 0;
        const difference = newAPHours - previousAPHours;
        if (difference !== 0) {
          updatedConfig.usedAPHours = Math.max(0, Math.min(updatedConfig.totalAPHours, updatedConfig.usedAPHours + difference));
        }
      }
      
      // If AP was approved but now it's not AP or not approved, restore the hours
      if (previousDayData?.dayStatus === 'assumpte_propi' && previousDayData?.requestStatus === 'aprovat') {
        if (dayData.dayStatus !== 'assumpte_propi' || dayData.requestStatus !== 'aprovat') {
          const previousAPHours = previousDayData?.apHours || 0;
          updatedConfig.usedAPHours = Math.max(0, updatedConfig.usedAPHours - previousAPHours);
        }
      }
      
      // Check if flexibility was used
      if (dayData.dayStatus === 'flexibilitat' && dayData.flexHours) {
        const previousFlexUsed = previousDayData?.dayStatus === 'flexibilitat' ? (previousDayData?.flexHours || 0) : 0;
        const difference = dayData.flexHours - previousFlexUsed;
        if (difference !== 0) {
          updatedConfig.flexibilityHours = Math.max(0, Math.min(25, updatedConfig.flexibilityHours - difference));
        }
      }
      
      // If flex was used but now it's not flex, restore the hours
      if (previousDayData?.dayStatus === 'flexibilitat' && previousDayData?.flexHours) {
        if (dayData.dayStatus !== 'flexibilitat') {
          updatedConfig.flexibilityHours = Math.min(25, updatedConfig.flexibilityHours + previousDayData.flexHours);
        }
      }
      
      // Check if worked 30+ min extra (only for laboral days)
      if (dayData.dayStatus === 'laboral' && dayData.startTime && dayData.endTime) {
        const date = new Date(dayData.date);
        const worked = calculateWorkedHours(dayData.startTime, dayData.endTime);
        const theoretical = getTheoreticalHoursForDate(date, updatedConfig);
        const extra = worked - theoretical;
        
        // If extra >= 0.5h (30 min), add to flexibility (max 25h)
        if (extra >= 0.5) {
          const previousWorked = previousDayData?.startTime && previousDayData?.endTime 
            ? calculateWorkedHours(previousDayData.startTime, previousDayData.endTime)
            : 0;
          const previousExtra = previousWorked - theoretical;
          const previousFXAdded = previousExtra >= 0.5 ? previousExtra : 0;
          const newFXToAdd = extra - previousFXAdded;
          
          if (newFXToAdd > 0) {
            updatedConfig.flexibilityHours = Math.min(25, updatedConfig.flexibilityHours + newFXToAdd);
          }
        }
      }
      
      if (JSON.stringify(updatedConfig) !== JSON.stringify(prev)) {
        saveUserConfig(updatedConfig);
        return updatedConfig;
      }
      return prev;
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
