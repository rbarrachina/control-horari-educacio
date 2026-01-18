import type { DayData, UserConfig, WeeklySummary, WeeklyConfig, ScheduleType } from '@/types';
import { DAYS_OF_WEEK, MAX_FLEXIBILITY_HOURS, MIN_WEEKLY_SURPLUS_FOR_FLEXIBILITY, SCHEDULE_HOURS } from './constants';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, getWeek, parseISO, getDay, addDays, isWithinInterval } from 'date-fns';

export function parseTimeToHours(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours + minutes / 60;
}

export function formatHoursToTime(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function calculateWorkedHours(startTime: string | null, endTime: string | null): number {
  if (!startTime || !endTime) return 0;
  const start = parseTimeToHours(startTime);
  const end = parseTimeToHours(endTime);
  return Math.max(0, end - start);
}

export function getDayOfWeekKey(date: Date): keyof WeeklyConfig | null {
  const dayIndex = getDay(date);
  const mapping: Record<number, keyof WeeklyConfig> = {
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
  };
  return mapping[dayIndex] || null;
}

export function getScheduleTypeForDate(date: Date, config: UserConfig): ScheduleType | null {
  const periods = config.schedulePeriods || [];
  for (const period of periods) {
    const start = parseISO(period.startDate);
    const end = parseISO(period.endDate);
    if (isWithinInterval(date, { start, end })) {
      return period.scheduleType;
    }
  }
  return null;
}

export function getTheoreticalHoursForDate(date: Date, config: UserConfig): number {
  const dayKey = getDayOfWeekKey(date);
  if (!dayKey) return 0; // Weekend
  
  const scheduleType = getScheduleTypeForDate(date, config);
  if (!scheduleType) return 7.5; // Default to winter if not defined
  
  return SCHEDULE_HOURS[scheduleType];
}

export function getDayTypeForDate(date: Date, config: UserConfig): 'presencial' | 'teletreball' {
  const dayKey = getDayOfWeekKey(date);
  if (!dayKey) return 'presencial';
  return config.weeklyConfig[dayKey].dayType;
}

export function isWeekend(date: Date): boolean {
  const day = getDay(date);
  return day === 0 || day === 6;
}

export function isHoliday(date: Date, holidays: string[]): boolean {
  const dateStr = format(date, 'yyyy-MM-dd');
  return holidays.includes(dateStr);
}

export function calculateWeeklySummary(
  weekStart: Date,
  daysData: Record<string, DayData>,
  config: UserConfig
): WeeklySummary {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  let theoreticalHours = 0;
  let workedHours = 0;
  
  days.forEach(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayData = daysData[dateStr];
    
    if (isWeekend(day) || isHoliday(day, config.holidays)) {
      return;
    }
    
    const theoretical = getTheoreticalHoursForDate(day, config);
    theoreticalHours += theoretical;
    
    if (dayData) {
      if (dayData.dayStatus === 'vacances') {
        workedHours += theoretical;
      } else if (dayData.dayStatus === 'assumpte_propi') {
        workedHours += (dayData.apHours || 0) + calculateWorkedHours(dayData.startTime, dayData.endTime);
      } else if (dayData.dayStatus === 'flexibilitat') {
        workedHours += (dayData.flexHours || 0) + calculateWorkedHours(dayData.startTime, dayData.endTime);
      } else {
        workedHours += calculateWorkedHours(dayData.startTime, dayData.endTime);
      }
    }
  });
  
  const difference = workedHours - theoreticalHours;
  const flexibilityGained = difference >= MIN_WEEKLY_SURPLUS_FOR_FLEXIBILITY 
    ? Math.min(difference, MAX_FLEXIBILITY_HOURS - config.flexibilityHours)
    : 0;
  
  return {
    weekNumber: getWeek(weekStart, { weekStartsOn: 1 }),
    startDate: format(weekStart, 'yyyy-MM-dd'),
    endDate: format(weekEnd, 'yyyy-MM-dd'),
    theoreticalHours,
    workedHours,
    difference,
    flexibilityGained,
  };
}

export function formatHoursDisplay(hours: number): string {
  const h = Math.floor(Math.abs(hours));
  const m = Math.round((Math.abs(hours) - h) * 60);
  const sign = hours < 0 ? '-' : '+';
  return `${sign}${h}h ${m}min`;
}
