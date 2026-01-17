import { cn } from '@/lib/utils';
import type { DayData, UserConfig } from '@/types';
import { calculateWorkedHours, isWeekend, isHoliday, getTheoreticalHoursForDate, getDayTypeForDate } from '@/lib/timeCalculations';
import { format } from 'date-fns';
import { Home, Building2, Plane, Clock, Sparkles, Calendar } from 'lucide-react';

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
    if (weekend) return 'bg-[hsl(var(--status-weekend))]';
    if (holiday) return 'bg-[hsl(var(--status-holiday))] text-[hsl(var(--status-holiday-foreground))]';
    if (dayData?.dayStatus === 'vacances') return 'bg-[hsl(var(--status-vacation))] text-[hsl(var(--status-vacation-foreground))]';
    
    if (!dayData?.startTime || !dayData?.endTime) {
      return 'bg-[hsl(var(--status-pending))] text-[hsl(var(--status-pending-foreground))]';
    }
    
    const worked = calculateWorkedHours(dayData.startTime, dayData.endTime);
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
    if (holiday) return <Calendar className="w-3 h-3" />;
    return null;
  };

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
            {dayData?.startTime && dayData?.endTime && (
              <div className="text-xs opacity-80">
                {dayData.startTime} - {dayData.endTime}
              </div>
            )}
            {getStatusIcon() && (
              <div className="absolute bottom-2 right-2">
                {getStatusIcon()}
              </div>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
