import { format, eachDayOfInterval, getWeek } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { DayData, UserConfig } from '@/types';
import { 
  getTheoreticalHoursForDate, 
  getDayTypeForDate, 
  calculateWorkedHours, 
  isHoliday, 
  isWeekend,
  formatHoursDisplay 
} from '@/lib/timeCalculations';
import { DAY_NAMES_CA, MONTH_NAMES_CA } from '@/lib/constants';
import { Home, Building2, Plane, Clock, Sparkles, Calendar, Check } from 'lucide-react';

interface WeeklySummaryDialogProps {
  weekStart: Date | null;
  weekEnd: Date | null;
  daysData: Record<string, DayData>;
  config: UserConfig;
  onClose: () => void;
}

export function WeeklySummaryDialog({ 
  weekStart, 
  weekEnd, 
  daysData, 
  config, 
  onClose
}: WeeklySummaryDialogProps) {
  if (!weekStart || !weekEnd) return null;

  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weekNumber = getWeek(weekStart, { weekStartsOn: 1 });

  const getDayName = (date: Date) => {
    const dayIndex = date.getDay();
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return DAY_NAMES_CA[dayKeys[dayIndex]];
  };

  // Calculate weekly totals
  let totalTheoretical = 0;
  let totalWorked = 0;

  for (const day of days) {
    if (isWeekend(day) || isHoliday(day, config.holidays)) continue;
    
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayData = daysData[dateStr];
    if (dayData?.dayStatus === 'vacances') continue;

    const theoretical = getTheoreticalHoursForDate(day, config);
    totalTheoretical += theoretical;
    
    if (dayData?.dayStatus === 'assumpte_propi') {
      totalWorked += (dayData.apHours || 0) + calculateWorkedHours(dayData.startTime, dayData.endTime);
    } else if (dayData?.dayStatus === 'flexibilitat') {
      totalWorked += (dayData.flexHours || 0) + calculateWorkedHours(dayData.startTime, dayData.endTime);
    } else {
      totalWorked += calculateWorkedHours(dayData?.startTime || null, dayData?.endTime || null);
    }
  }

  const difference = totalWorked - totalTheoretical;

  const getDayStatusLabel = (dayData: DayData | undefined, holiday: boolean) => {
    if (holiday) return 'Festiu';
    if (!dayData) return 'Laboral';
    if (dayData.dayStatus === 'vacances') return 'Vacances';
    if (dayData.dayStatus === 'assumpte_propi') return 'AP';
    if (dayData.dayStatus === 'flexibilitat') return 'FX';
    return 'Laboral';
  };

  const getDayStatusIcon = (dayData: DayData | undefined, holiday: boolean) => {
    if (holiday) return Calendar;
    if (dayData?.dayStatus === 'vacances') return Plane;
    if (dayData?.dayStatus === 'assumpte_propi') return Clock;
    if (dayData?.dayStatus === 'flexibilitat') return Sparkles;
    return null;
  };

  const getStatusCardClass = (dayData: DayData | undefined, holiday: boolean, worked: number, theoretical: number) => {
    if (holiday) return 'bg-[hsl(var(--status-holiday)/0.15)] border-[hsl(var(--status-holiday)/0.4)]';
    if (dayData?.dayStatus === 'vacances') {
      return 'bg-[hsl(var(--status-vacation)/0.15)] border-[hsl(var(--status-vacation)/0.4)]';
    }
    if (dayData?.dayStatus === 'assumpte_propi' || dayData?.dayStatus === 'flexibilitat') {
      return dayData?.requestStatus === 'aprovat'
        ? 'bg-[hsl(var(--status-complete)/0.15)] border-[hsl(var(--status-complete)/0.4)]'
        : 'bg-[hsl(var(--status-deficit)/0.15)] border-[hsl(var(--status-deficit)/0.4)]';
    }
    if (!dayData?.startTime || !dayData?.endTime) {
      return 'bg-[hsl(var(--status-weekday-empty)/0.4)] border-[hsl(var(--status-weekday-empty))]';
    }
    return worked >= theoretical
      ? 'bg-[hsl(var(--status-complete)/0.15)] border-[hsl(var(--status-complete)/0.4)]'
      : 'bg-[hsl(var(--status-deficit)/0.15)] border-[hsl(var(--status-deficit)/0.4)]';
  };

  const formatHours = (hours: number) => `${hours.toFixed(1)}h`;

  return (
    <Dialog open={!!weekStart} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Resum Setmana {weekNumber}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {format(weekStart, 'd')} - {format(weekEnd, 'd')} de {MONTH_NAMES_CA[weekStart.getMonth()]}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {days.map((day) => {
            if (isWeekend(day)) return null;
            
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayData = daysData[dateStr];
            const holiday = isHoliday(day, config.holidays);
            const dayType = getDayTypeForDate(day, config);
            const theoretical = getTheoreticalHoursForDate(day, config);
            const baseWorked = calculateWorkedHours(dayData?.startTime || null, dayData?.endTime || null);
            const extraHours = dayData?.dayStatus === 'assumpte_propi'
              ? (dayData.apHours || 0)
              : dayData?.dayStatus === 'flexibilitat'
                ? (dayData.flexHours || 0)
                : 0;
            const worked = baseWorked + extraHours;
            const excludedFromTotals = holiday || dayData?.dayStatus === 'vacances';
            const summaryTheoretical = excludedFromTotals ? 0 : theoretical;
            const summaryWorked = excludedFromTotals ? 0 : worked;
            const dayDifference = summaryWorked - summaryTheoretical;
            const DayIcon = dayType === 'teletreball' ? Home : Building2;
            const StatusIcon = getDayStatusIcon(dayData, holiday);
            const statusLabel = getDayStatusLabel(dayData, holiday);
            const statusCardClass = getStatusCardClass(dayData, holiday, worked, theoretical);
            
            return (
              <div
                key={dateStr}
                className={`p-4 rounded-lg space-y-4 border ${statusCardClass}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{getDayName(day)}, {format(day, 'd')}</span>
                    <Badge variant={dayType === 'presencial' ? 'default' : 'secondary'} className="text-xs">
                      <DayIcon className="w-3 h-3 mr-1" />
                      {dayType === 'presencial' ? 'Presencial' : 'Teletreball'}
                    </Badge>
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      {StatusIcon && <StatusIcon className="w-3 h-3" />}
                      {statusLabel}
                    </Badge>
                    {dayData?.requestStatus === 'aprovat' && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Aprovat
                      </Badge>
                    )}
                    {excludedFromTotals && (
                      <Badge variant="secondary" className="text-xs">
                        No computa
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline">{formatHours(summaryTheoretical)} teòriques</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Horari</p>
                    {holiday || dayData?.dayStatus === 'vacances' ? (
                      <p className="font-medium">—</p>
                    ) : dayData?.startTime && dayData?.endTime ? (
                      <p className="font-medium">{dayData.startTime} - {dayData.endTime}</p>
                    ) : (
                      <p className="font-medium text-muted-foreground">Sense horari</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Hores treballades</p>
                    <p className="font-medium">{formatHours(summaryWorked)}</p>
                    {extraHours > 0 && (
                      <p className="text-xs text-muted-foreground">
                        +{extraHours.toFixed(1)}h {dayData?.dayStatus === 'assumpte_propi' ? 'AP' : 'FX'}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Diferència</p>
                    <p className={`font-semibold ${dayDifference >= 0 ? 'text-[hsl(var(--status-complete))]' : 'text-[hsl(var(--status-deficit))]'}`}>
                      {formatHoursDisplay(dayDifference)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          
          <Separator />
          
          <div className="p-4 bg-card rounded-lg border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Hores teòriques</p>
                <p className="text-2xl font-bold">{totalTheoretical.toFixed(1)}h</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hores treballades</p>
                <p className="text-2xl font-bold">{totalWorked.toFixed(1)}h</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Diferència</p>
                <p className={`text-2xl font-bold ${difference >= 0 ? 'text-[hsl(var(--status-complete))]' : 'text-[hsl(var(--status-deficit))]'}`}>
                  {formatHoursDisplay(difference)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>
            Tancar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
