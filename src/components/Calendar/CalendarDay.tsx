import { cn } from '@/lib/utils';
import type { DayData, UserConfig } from '@/types';
import { calculateDayWorkedHours, isWeekend, isHoliday, getTheoreticalHoursForDate, getDayTypeForDate } from '@/lib/timeCalculations';
import { format } from 'date-fns';
import { Home, Building2, Plane, Clock, Sparkles, Calendar, Check, MoreHorizontal } from 'lucide-react';

interface CalendarDayProps {
  date: Date;
  dayData: DayData | null;
  config: UserConfig;
  isCurrentMonth: boolean;
  isToday: boolean;
  onClick: () => void;
}

export function CalendarDay({ date, dayData, config, isCurrentMonth, isToday, onClick }: CalendarDayProps) {
  const weekend = isWeekend(date);
  const holiday = isHoliday(date, config.holidays);
  const dateStr = format(date, 'yyyy-MM-dd');
  
  const getStatusColor = () => {
    // Weekend with holiday = purple
    if (weekend && holiday) return 'bg-[hsl(var(--status-holiday))] text-[hsl(var(--status-holiday-foreground))]';
    // Weekend = dark grey
    if (weekend) return 'bg-[hsl(var(--status-weekend))] text-foreground';
    // Holiday = purple
    if (holiday) return 'bg-[hsl(var(--status-holiday))] text-[hsl(var(--status-holiday-foreground))]';
    
    // Vacances = blue
    if (dayData?.dayStatus === 'vacances') {
      return 'bg-[hsl(var(--status-vacation))] text-[hsl(var(--status-vacation-foreground))]';
    }
    
    // AP or FX with approval status
    if (dayData?.dayStatus === 'assumpte_propi' || dayData?.dayStatus === 'flexibilitat' || dayData?.dayStatus === 'altres') {
      const worked = calculateDayWorkedHours(dayData);
      const theoretical = getTheoreticalHoursForDate(date, config);
      const extraHours = dayData.dayStatus === 'assumpte_propi'
        ? (dayData.apHours || 0)
        : dayData.dayStatus === 'flexibilitat'
          ? (dayData.flexHours || 0)
          : (dayData.otherHours || 0);
      const totalWorked = worked + extraHours;
      if (dayData.requestStatus === 'aprovat' && totalWorked >= theoretical) {
        return 'bg-[hsl(var(--status-complete))] text-[hsl(var(--status-complete-foreground))]';
      }
      return 'bg-[hsl(var(--status-deficit))] text-[hsl(var(--status-deficit-foreground))]';
    }
    
    // No data = light grey
    const hasAnyShift = Boolean(
      (dayData?.startTime && dayData?.endTime) || (dayData?.startTime2 && dayData?.endTime2)
    );
    if (!hasAnyShift) {
      return 'bg-[hsl(var(--status-weekday-empty))] text-[hsl(var(--status-pending-foreground))]';
    }
    
    const worked = calculateDayWorkedHours(dayData);
    const theoretical = getTheoreticalHoursForDate(date, config);
    
    if (worked >= theoretical) {
      return 'bg-[hsl(var(--status-complete))] text-[hsl(var(--status-complete-foreground))]';
    }
    return 'bg-[hsl(var(--status-deficit))] text-[hsl(var(--status-deficit-foreground))]';
  };

  const dayType = getDayTypeForDate(date, config);
  const DayIcon = dayType === 'teletreball' ? Home : Building2;

  const getStatusIcon = () => {
    if (dayData?.dayStatus === 'vacances') return <Plane className="w-3 h-3" />;
    if (dayData?.dayStatus === 'assumpte_propi') return <Clock className="w-3 h-3" />;
    if (dayData?.dayStatus === 'flexibilitat') return <Sparkles className="w-3 h-3" />;
    if (dayData?.dayStatus === 'altres') return <MoreHorizontal className="w-3 h-3" />;
    if (holiday) return <Calendar className="w-3 h-3" />;
    return null;
  };

  const getApprovalIcon = () => {
    if ((dayData?.dayStatus === 'assumpte_propi' || dayData?.dayStatus === 'flexibilitat' || dayData?.dayStatus === 'altres' || dayData?.dayStatus === 'vacances') 
        && dayData?.requestStatus === 'aprovat') {
      return <Check className="w-3 h-3" />;
    }
    return null;
  };

  const formatAbsenceHours = (hours: number): string => {
    const h = Math.floor(hours);
    let m = Math.round((hours % 1) * 60);
    let adjustedHours = h;
    if (m === 60) {
      adjustedHours += 1;
      m = 0;
    }
    if (adjustedHours > 0 && m > 0) {
      return `${adjustedHours}h ${m}min`;
    }
    if (adjustedHours > 0) {
      return `${adjustedHours}h`;
    }
    return `${m} min`;
  };

  const getAbsenceDisplay = () => {
    if (dayData?.dayStatus === 'assumpte_propi' && dayData.apHours) {
      return `AP = ${formatAbsenceHours(dayData.apHours)}`;
    }
    if (dayData?.dayStatus === 'flexibilitat' && dayData.flexHours) {
      return `FX = ${formatAbsenceHours(dayData.flexHours)}`;
    }
    if (dayData?.dayStatus === 'altres' && dayData.otherHours) {
      return `Altres = ${formatAbsenceHours(dayData.otherHours)}`;
    }
    return null;
  };

  const getShiftDisplay = () => {
    const shifts: string[] = [];
    if (dayData?.startTime && dayData?.endTime) {
      shifts.push(`${dayData.startTime} - ${dayData.endTime}`);
    }
    if (dayData?.startTime2 && dayData?.endTime2) {
      shifts.push(`${dayData.startTime2} - ${dayData.endTime2}`);
    }
    return shifts;
  };

  const shifts = getShiftDisplay();

  return (
    <button
      onClick={onClick}
      disabled={weekend}
      className={cn(
        'relative p-2 h-20 w-full rounded-lg transition-all duration-200 border',
        'hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary',
        getStatusColor(),
        !isCurrentMonth && 'opacity-40',
        isToday && 'ring-2 ring-primary ring-offset-2',
        weekend && 'cursor-default hover:scale-100 hover:shadow-none'
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between">
          <span className={cn('text-sm font-semibold', isToday && 'text-primary')}>
            {format(date, 'd')}
          </span>
          {!weekend && !holiday && (
            <DayIcon className="w-3.5 h-3.5 opacity-70" />
          )}
        </div>
        
        {!weekend && (
          <div className="flex-1 flex flex-col justify-end">
            {shifts.length > 0 && (
              <div className="text-xs opacity-80 space-y-0.5">
                {shifts.map((shift) => (
                  <div key={shift}>{shift}</div>
                ))}
              </div>
            )}
            {getAbsenceDisplay() && (
              <div className="text-xs opacity-80 font-medium">
                {getAbsenceDisplay()}
              </div>
            )}
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              {getApprovalIcon()}
              {getStatusIcon()}
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
