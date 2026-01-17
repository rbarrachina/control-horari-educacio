import { useState, useEffect } from 'react';
import { format, eachDayOfInterval, getWeek } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { DayData, UserConfig, DayStatus, RequestStatus } from '@/types';
import { 
  getTheoreticalHoursForDate, 
  getDayTypeForDate, 
  calculateWorkedHours, 
  isHoliday, 
  isWeekend,
  formatHoursDisplay 
} from '@/lib/timeCalculations';
import { DAY_NAMES_CA, MONTH_NAMES_CA } from '@/lib/constants';
import { Home, Building2, Plane, Clock, Sparkles, Calendar } from 'lucide-react';

interface WeeklySummaryDialogProps {
  weekStart: Date | null;
  weekEnd: Date | null;
  daysData: Record<string, DayData>;
  config: UserConfig;
  onClose: () => void;
  onSaveDay: (dayData: DayData) => void;
}

interface DayEditState {
  startTime: string;
  endTime: string;
  dayStatus: DayStatus;
  requestStatus: RequestStatus;
  apHours: number;
  flexHours: number;
}

export function WeeklySummaryDialog({ 
  weekStart, 
  weekEnd, 
  daysData, 
  config, 
  onClose, 
  onSaveDay 
}: WeeklySummaryDialogProps) {
  const [editStates, setEditStates] = useState<Record<string, DayEditState>>({});
  
  useEffect(() => {
    if (!weekStart || !weekEnd) return;
    
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const newStates: Record<string, DayEditState> = {};
    
    for (const day of days) {
      if (isWeekend(day)) continue;
      
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayData = daysData[dateStr];
      
      newStates[dateStr] = {
        startTime: dayData?.startTime || config.defaultStartTime,
        endTime: dayData?.endTime || config.defaultEndTime,
        dayStatus: dayData?.dayStatus || 'laboral',
        requestStatus: dayData?.requestStatus || null,
        apHours: dayData?.apHours || 0,
        flexHours: dayData?.flexHours || 0,
      };
    }
    
    setEditStates(newStates);
  }, [weekStart, weekEnd, daysData, config]);

  if (!weekStart || !weekEnd) return null;

  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weekNumber = getWeek(weekStart, { weekStartsOn: 1 });

  const getDayName = (date: Date) => {
    const dayIndex = date.getDay();
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return DAY_NAMES_CA[dayKeys[dayIndex]];
  };

  const updateDayState = (dateStr: string, field: keyof DayEditState, value: any) => {
    setEditStates(prev => ({
      ...prev,
      [dateStr]: {
        ...prev[dateStr],
        [field]: value,
      }
    }));
  };

  const handleSaveAll = () => {
    for (const day of days) {
      if (isWeekend(day)) continue;
      
      const dateStr = format(day, 'yyyy-MM-dd');
      const state = editStates[dateStr];
      if (!state) continue;
      
      const theoreticalHours = getTheoreticalHoursForDate(day, config);
      const dayType = getDayTypeForDate(day, config);
      
      const newDayData: DayData = {
        date: dateStr,
        theoreticalHours,
        startTime: state.dayStatus === 'vacances' ? null : state.startTime,
        endTime: state.dayStatus === 'vacances' ? null : state.endTime,
        dayType,
        dayStatus: state.dayStatus,
        requestStatus: state.requestStatus,
        apHours: state.dayStatus === 'assumpte_propi' ? state.apHours : undefined,
        flexHours: state.dayStatus === 'flexibilitat' ? state.flexHours : undefined,
      };
      
      onSaveDay(newDayData);
    }
    onClose();
  };

  // Calculate weekly totals
  let totalTheoretical = 0;
  let totalWorked = 0;

  for (const day of days) {
    if (isWeekend(day) || isHoliday(day, config.holidays)) continue;
    
    const dateStr = format(day, 'yyyy-MM-dd');
    const state = editStates[dateStr];
    if (!state) continue;
    
    const theoretical = getTheoreticalHoursForDate(day, config);
    totalTheoretical += theoretical;
    
    if (state.dayStatus === 'vacances') {
      totalWorked += theoretical;
    } else if (state.dayStatus === 'assumpte_propi') {
      totalWorked += (state.apHours || 0) + calculateWorkedHours(state.startTime, state.endTime);
    } else if (state.dayStatus === 'flexibilitat') {
      totalWorked += (state.flexHours || 0) + calculateWorkedHours(state.startTime, state.endTime);
    } else {
      totalWorked += calculateWorkedHours(state.startTime, state.endTime);
    }
  }

  const difference = totalWorked - totalTheoretical;

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
            const state = editStates[dateStr];
            if (!state) return null;
            
            const holiday = isHoliday(day, config.holidays);
            const dayType = getDayTypeForDate(day, config);
            const theoretical = getTheoreticalHoursForDate(day, config);
            const worked = state.dayStatus === 'vacances' 
              ? theoretical 
              : calculateWorkedHours(state.startTime, state.endTime);
            const DayIcon = dayType === 'teletreball' ? Home : Building2;
            
            return (
              <div key={dateStr} className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{getDayName(day)}, {format(day, 'd')}</span>
                    <Badge variant={dayType === 'presencial' ? 'default' : 'secondary'} className="text-xs">
                      <DayIcon className="w-3 h-3 mr-1" />
                      {dayType === 'presencial' ? 'Presencial' : 'Teletreball'}
                    </Badge>
                    {holiday && <Badge variant="destructive">Festiu</Badge>}
                  </div>
                  <Badge variant="outline">{theoretical}h teòriques</Badge>
                </div>
                
                {!holiday && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Tipus</Label>
                      <Select 
                        value={state.dayStatus} 
                        onValueChange={(v) => updateDayState(dateStr, 'dayStatus', v)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="laboral">Laboral</SelectItem>
                          <SelectItem value="vacances">Vacances</SelectItem>
                          <SelectItem value="assumpte_propi">AP</SelectItem>
                          <SelectItem value="flexibilitat">FX</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {state.dayStatus !== 'vacances' && (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs">Inici</Label>
                          <Input
                            type="time"
                            value={state.startTime}
                            onChange={(e) => updateDayState(dateStr, 'startTime', e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Fi</Label>
                          <Input
                            type="time"
                            value={state.endTime}
                            onChange={(e) => updateDayState(dateStr, 'endTime', e.target.value)}
                            className="h-8"
                          />
                        </div>
                      </>
                    )}
                    
                    {(state.dayStatus === 'vacances' || state.dayStatus === 'assumpte_propi' || state.dayStatus === 'flexibilitat') && (
                      <div className="space-y-1">
                        <Label className="text-xs">Estat</Label>
                        <Select 
                          value={state.requestStatus || 'none'} 
                          onValueChange={(v) => updateDayState(dateStr, 'requestStatus', v === 'none' ? null : v)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sense sol·licitar</SelectItem>
                            <SelectItem value="pendent">Pendent</SelectItem>
                            <SelectItem value="aprovat">Aprovat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {state.dayStatus === 'assumpte_propi' && (
                      <div className="space-y-1">
                        <Label className="text-xs">Hores AP</Label>
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          value={state.apHours}
                          onChange={(e) => updateDayState(dateStr, 'apHours', parseFloat(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                    )}
                    
                    {state.dayStatus === 'flexibilitat' && (
                      <div className="space-y-1">
                        <Label className="text-xs">Hores FX</Label>
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          value={state.flexHours}
                          onChange={(e) => updateDayState(dateStr, 'flexHours', parseFloat(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                    )}
                  </div>
                )}
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
          <Button variant="outline" onClick={onClose}>
            Cancel·lar
          </Button>
          <Button onClick={handleSaveAll}>
            Desar tot
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
