import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import type { DayData, UserConfig, DayStatus, RequestStatus } from '@/types';
import { getTheoreticalHoursForDate, getDayTypeForDate, calculateWorkedHours, isHoliday } from '@/lib/timeCalculations';
import { DAY_NAMES_CA, MONTH_NAMES_CA } from '@/lib/constants';

interface DayDetailDialogProps {
  date: Date | null;
  dayData: DayData | null;
  config: UserConfig;
  onClose: () => void;
  onSave: (dayData: DayData) => void;
}

export function DayDetailDialog({ date, dayData, config, onClose, onSave }: DayDetailDialogProps) {
  const [startTime, setStartTime] = useState(config.defaultStartTime);
  const [endTime, setEndTime] = useState(config.defaultEndTime);
  const [dayStatus, setDayStatus] = useState<DayStatus>('laboral');
  const [requestStatus, setRequestStatus] = useState<RequestStatus>(null);
  const [apHours, setApHours] = useState(0);
  const [flexHours, setFlexHours] = useState(0);

  useEffect(() => {
    if (dayData) {
      setStartTime(dayData.startTime || config.defaultStartTime);
      setEndTime(dayData.endTime || config.defaultEndTime);
      setDayStatus(dayData.dayStatus);
      setRequestStatus(dayData.requestStatus);
      setApHours(dayData.apHours || 0);
      setFlexHours(dayData.flexHours || 0);
    } else {
      setStartTime(config.defaultStartTime);
      setEndTime(config.defaultEndTime);
      setDayStatus('laboral');
      setRequestStatus(null);
      setApHours(0);
      setFlexHours(0);
    }
  }, [dayData, config, date]);

  if (!date) return null;

  const theoreticalHours = getTheoreticalHoursForDate(date, config);
  const dayType = getDayTypeForDate(date, config);
  const workedHours = calculateWorkedHours(startTime, endTime);
  const difference = workedHours - theoreticalHours;
  const holiday = isHoliday(date, config.holidays);

  const getDayName = () => {
    const dayIndex = date.getDay();
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return DAY_NAMES_CA[dayKeys[dayIndex]];
  };

  const handleSave = () => {
    const newDayData: DayData = {
      date: format(date, 'yyyy-MM-dd'),
      theoreticalHours,
      startTime: dayStatus === 'vacances' ? null : startTime,
      endTime: dayStatus === 'vacances' ? null : endTime,
      dayType,
      dayStatus,
      requestStatus,
      apHours: dayStatus === 'assumpte_propi' ? apHours : undefined,
      flexHours: dayStatus === 'flexibilitat' ? flexHours : undefined,
    };
    onSave(newDayData);
    onClose();
  };

  return (
    <Dialog open={!!date} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {getDayName()}, {format(date, 'd')} de {MONTH_NAMES_CA[date.getMonth()]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center gap-2">
            <Badge variant={dayType === 'presencial' ? 'default' : 'secondary'}>
              {dayType === 'presencial' ? '🏢 Presencial' : '🏠 Teletreball'}
            </Badge>
            <Badge variant="outline">{theoreticalHours}h teòriques</Badge>
            {holiday && <Badge variant="destructive">Festiu</Badge>}
          </div>

          <div className="space-y-3">
            <Label>Tipus de dia</Label>
            <Select value={dayStatus} onValueChange={(v) => setDayStatus(v as DayStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="laboral">Dia laboral</SelectItem>
                <SelectItem value="vacances">Vacances</SelectItem>
                <SelectItem value="assumpte_propi">Assumpte propi</SelectItem>
                <SelectItem value="flexibilitat">Flexibilitat horària</SelectItem>
                <SelectItem value="festiu">Festiu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dayStatus !== 'vacances' && dayStatus !== 'festiu' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora d'inici</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  min="07:30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Hora de fi</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {dayStatus === 'assumpte_propi' && (
            <div className="space-y-2">
              <Label htmlFor="apHours">Hores d'AP utilitzades</Label>
              <Input
                id="apHours"
                type="number"
                step="0.5"
                min="0"
                max={theoreticalHours}
                value={apHours}
                onChange={(e) => setApHours(parseFloat(e.target.value) || 0)}
              />
            </div>
          )}

          {dayStatus === 'flexibilitat' && (
            <div className="space-y-2">
              <Label htmlFor="flexHours">Hores de flexibilitat utilitzades</Label>
              <Input
                id="flexHours"
                type="number"
                step="0.5"
                min="0"
                max={config.flexibilityHours}
                value={flexHours}
                onChange={(e) => setFlexHours(parseFloat(e.target.value) || 0)}
              />
            </div>
          )}

          {(dayStatus === 'vacances' || dayStatus === 'assumpte_propi' || dayStatus === 'flexibilitat') && (
            <div className="space-y-3">
              <Label>Estat de la sol·licitud</Label>
              <Select 
                value={requestStatus || 'none'} 
                onValueChange={(v) => setRequestStatus(v === 'none' ? null : v as RequestStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona estat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sense sol·licitar</SelectItem>
                  <SelectItem value="pendent">Pendent d'aprovació</SelectItem>
                  <SelectItem value="aprovat">Aprovat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {dayStatus === 'laboral' && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm space-y-1">
                <p>Hores treballades: <strong>{workedHours.toFixed(2)}h</strong></p>
                <p className={difference >= 0 ? 'text-[hsl(var(--status-complete))]' : 'text-[hsl(var(--status-deficit))]'}>
                  Diferència: <strong>{difference >= 0 ? '+' : ''}{difference.toFixed(2)}h</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel·lar
          </Button>
          <Button onClick={handleSave}>
            Desar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
