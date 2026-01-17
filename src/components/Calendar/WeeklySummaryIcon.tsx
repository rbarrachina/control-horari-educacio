import { cn } from '@/lib/utils';
import type { DayData, UserConfig } from '@/types';
import { isWeekend, isHoliday, calculateWorkedHours, getTheoreticalHoursForDate } from '@/lib/timeCalculations';
import { format, eachDayOfInterval } from 'date-fns';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface WeeklySummaryIconProps {
  weekStart: Date;
  weekEnd: Date;
  daysData: Record<string, DayData>;
  config: UserConfig;
  onClick: () => void;
}

export function WeeklySummaryIcon({ weekStart, weekEnd, daysData, config, onClick }: WeeklySummaryIconProps) {
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Check if all workdays have data or are properly handled
  let allComplete = true;
  let hasAnyData = false;
  
  for (const day of days) {
    if (isWeekend(day)) continue;
    if (isHoliday(day, config.holidays)) continue;
    
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayData = daysData[dateStr];
    
    if (!dayData) {
      allComplete = false;
      continue;
    }
    
    hasAnyData = true;
    
    // Check if pending approval
    if (dayData.requestStatus === 'pendent') {
      allComplete = false;
    }
    
    // Check if laboral day has times
    if (dayData.dayStatus === 'laboral' && (!dayData.startTime || !dayData.endTime)) {
      allComplete = false;
    }
  }
  
  // If no data at all, show yellow
  if (!hasAnyData) {
    allComplete = false;
  }
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110',
        allComplete 
          ? 'bg-[hsl(var(--status-complete))] text-[hsl(var(--status-complete-foreground))]' 
          : 'bg-[hsl(var(--status-deficit))] text-[hsl(var(--status-deficit-foreground))]'
      )}
      title={allComplete ? 'Setmana completa' : 'Setmana amb pendents'}
    >
      {allComplete ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <AlertCircle className="w-5 h-5" />
      )}
    </button>
  );
}
