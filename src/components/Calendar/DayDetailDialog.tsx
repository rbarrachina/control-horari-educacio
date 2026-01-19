import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { DayData, UserConfig, DayStatus, RequestStatus } from '@/types';
import { getTheoreticalHoursForDate, getDayTypeForDate, calculateWorkedHours, isHoliday, formatHoursToTime } from '@/lib/timeCalculations';
import { DAY_NAMES_CA, MAX_FLEXIBILITY_HOURS, MONTH_NAMES_CA } from '@/lib/constants';
import { Home, Building2, Trash2 } from 'lucide-react';

interface DayDetailDialogProps {
  date: Date | null;
  dayData: DayData | null;
  config: UserConfig;
  requestedVacationDays: number;
  onClose: () => void;
  onSave: (dayData: DayData) => void;
}

type AbsenceType = 'cap' | 'vacances' | 'assumpte_propi' | 'flexibilitat';

export function DayDetailDialog({ date, dayData, config, requestedVacationDays, onClose, onSave }: DayDetailDialogProps) {
  const [startTime, setStartTime] = useState(config.defaultStartTime);
  const [endTime, setEndTime] = useState(config.defaultEndTime);
  const [absenceType, setAbsenceType] = useState<AbsenceType>('cap');
  const [isApproved, setIsApproved] = useState(false);
  const [absenceHours, setAbsenceHours] = useState(0);
  const [absenceMinutes, setAbsenceMinutes] = useState(0);
  const [vacationError, setVacationError] = useState('');
  const [apError, setApError] = useState('');

  useEffect(() => {
    if (dayData) {
      setStartTime(dayData.startTime === null ? '' : (dayData.startTime ?? config.defaultStartTime));
      setEndTime(dayData.endTime === null ? '' : (dayData.endTime ?? config.defaultEndTime));
      
      // Determine absence type from dayStatus
      if (dayData.dayStatus === 'vacances') {
        setAbsenceType('vacances');
      } else if (dayData.dayStatus === 'assumpte_propi') {
        setAbsenceType('assumpte_propi');
        const hours = dayData.apHours || 0;
        setAbsenceHours(Math.floor(hours));
        setAbsenceMinutes(Math.round((hours % 1) * 60));
      } else if (dayData.dayStatus === 'flexibilitat') {
        setAbsenceType('flexibilitat');
        const hours = dayData.flexHours || 0;
        setAbsenceHours(Math.floor(hours));
        setAbsenceMinutes(Math.round((hours % 1) * 60));
      } else {
        setAbsenceType('cap');
      }
      
      setIsApproved(dayData.requestStatus === 'aprovat');
    } else {
      setStartTime(config.defaultStartTime);
      setEndTime(config.defaultEndTime);
      setAbsenceType('cap');
      setIsApproved(false);
      setAbsenceHours(0);
      setAbsenceMinutes(0);
    }
    setVacationError('');
    setApError('');
  }, [dayData, config, date]);

  if (!date) return null;

  const theoreticalHours = getTheoreticalHoursForDate(date, config);
  const dayType = getDayTypeForDate(date, config);
  const actualWorkedHours = startTime && endTime ? calculateWorkedHours(startTime, endTime) : 0;
  const absenceHoursDecimal = absenceHours + (absenceMinutes / 60);
  const previousFlexHours = dayData?.dayStatus === 'flexibilitat' ? (dayData.flexHours || 0) : 0;
  const previousAPHours = dayData?.dayStatus === 'assumpte_propi' ? (dayData.apHours || 0) : 0;
  const availableFlexHours = Math.min(
    MAX_FLEXIBILITY_HOURS,
    Math.max(0, config.flexibilityHours - config.usedFlexHours + previousFlexHours)
  );
  const availableAPHours = Math.max(0, config.totalAPHours - config.usedAPHours + previousAPHours);
  const maxFlexHours = Math.min(theoreticalHours, availableFlexHours);
  
  // Total worked hours = actual worked + AP/FX hours (if applicable)
  const totalWorkedHours = absenceType === 'vacances' 
    ? theoreticalHours  // Vacances counts as full day
    : (absenceType === 'assumpte_propi' || absenceType === 'flexibilitat')
      ? actualWorkedHours + absenceHoursDecimal
      : actualWorkedHours;
  
  const difference = totalWorkedHours - theoreticalHours;
  const holiday = isHoliday(date, config.holidays);

  const getDayName = () => {
    const dayIndex = date.getDay();
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return DAY_NAMES_CA[dayKeys[dayIndex]];
  };

  const formatHoursMinutes = (hours: number): string => {
    const h = Math.floor(Math.abs(hours));
    const m = Math.round((Math.abs(hours) % 1) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const getDayStatus = (): DayStatus => {
    if (holiday) return 'festiu';
    if (absenceType === 'vacances') return 'vacances';
    if (absenceType === 'assumpte_propi') return 'assumpte_propi';
    if (absenceType === 'flexibilitat') return 'flexibilitat';
    return 'laboral';
  };

  const getRequestStatus = (): RequestStatus => {
    if (absenceType === 'cap') return null;
    return isApproved ? 'aprovat' : 'pendent';
  };

  const getAbsenceHoursDecimal = (): number => {
    return absenceHours + (absenceMinutes / 60);
  };

  const handleSave = () => {
    const isCurrentlyVacation = dayData?.dayStatus === 'vacances';
    const effectiveRequestedVacations = requestedVacationDays - (isCurrentlyVacation ? 1 : 0);
    const exceedsVacationLimit = absenceType === 'vacances' && !isCurrentlyVacation
      && effectiveRequestedVacations >= config.totalVacationDays;

    if (exceedsVacationLimit) {
      setVacationError('Ja has demanat el màxim de dies de vacances.');
      return;
    }

    if (absenceType === 'assumpte_propi' && getAbsenceHoursDecimal() > availableAPHours) {
      setApError('No queden prou hores d’AP disponibles.');
      return;
    }

    const cappedFlexHours = absenceType === 'flexibilitat'
      ? Math.min(getAbsenceHoursDecimal(), maxFlexHours)
      : undefined;
    const newDayData: DayData = {
      date: format(date, 'yyyy-MM-dd'),
      theoreticalHours,
      startTime: absenceType === 'vacances' ? null : (startTime || null),
      endTime: absenceType === 'vacances' ? null : (endTime || null),
      dayType,
      dayStatus: getDayStatus(),
      requestStatus: getRequestStatus(),
      apHours: absenceType === 'assumpte_propi' ? getAbsenceHoursDecimal() : undefined,
      flexHours: absenceType === 'flexibilitat' ? cappedFlexHours : undefined,
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
          {/* Day type and theoretical hours */}
          <div className="flex items-center gap-3">
            <Badge variant={dayType === 'presencial' ? 'default' : 'secondary'} className="flex items-center gap-1.5">
              {dayType === 'presencial' ? (
                <><Building2 className="w-3 h-3" /> Presencial</>
              ) : (
                <><Home className="w-3 h-3" /> Teletreball</>
              )}
            </Badge>
            <Badge variant="outline">{formatHoursMinutes(theoreticalHours)}</Badge>
            {holiday && <Badge variant="destructive">Festiu</Badge>}
          </div>

          {/* Start and end time */}
          {absenceType !== 'vacances' && startTime && endTime && (
            <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end">
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
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setStartTime('');
                  setEndTime('');
                }}
                className="text-muted-foreground hover:text-destructive"
                title="Esborrar horari"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Show add time button when no times */}
          {absenceType !== 'vacances' && (!startTime || !endTime) && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStartTime(config.defaultStartTime);
                setEndTime(config.defaultEndTime);
              }}
              className="w-full"
            >
              Afegir horari presencial
            </Button>
          )}

          {/* Absence type selector */}
          <div className="space-y-3">
            <Label>Absència</Label>
            <Select value={absenceType} onValueChange={(v) => {
              setAbsenceType(v as AbsenceType);
              if (v !== 'vacances') {
                setVacationError('');
              } else if (dayData?.dayStatus !== 'vacances' && requestedVacationDays >= config.totalVacationDays) {
                setVacationError('Ja has demanat el màxim de dies de vacances.');
              } else {
                setVacationError('');
              }
              if (v !== 'assumpte_propi') {
                setApError('');
              }
              if (v === 'cap') {
                setIsApproved(false);
                setAbsenceHours(0);
                setAbsenceMinutes(0);
              }
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cap">Cap absència</SelectItem>
                <SelectItem value="vacances">Vacances</SelectItem>
                <SelectItem value="assumpte_propi">Assumpte propi (AP)</SelectItem>
                <SelectItem value="flexibilitat">Flexibilitat horària (FX)</SelectItem>
              </SelectContent>
            </Select>
            {vacationError && (
              <p className="text-sm text-destructive">{vacationError}</p>
            )}
            {apError && (
              <p className="text-sm text-destructive">{apError}</p>
            )}
          </div>

          {/* Hours/minutes input for AP or FX */}
          {(absenceType === 'assumpte_propi' || absenceType === 'flexibilitat') && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="absenceHours">Hores</Label>
                  <Input
                    id="absenceHours"
                    type="number"
                    min="0"
                    max={absenceType === 'flexibilitat' ? Math.floor(maxFlexHours) : Math.floor(theoreticalHours)}
                    value={absenceHours}
                    onChange={(e) => {
                      setAbsenceHours(parseInt(e.target.value) || 0);
                      if (absenceType === 'assumpte_propi') {
                        setApError('');
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="absenceMinutes">Minuts</Label>
                  <Input
                    id="absenceMinutes"
                    type="number"
                    min="0"
                    max="59"
                    step="5"
                    value={absenceMinutes}
                    onChange={(e) => {
                      setAbsenceMinutes(parseInt(e.target.value) || 0);
                      if (absenceType === 'assumpte_propi') {
                        setApError('');
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="approved"
                  checked={isApproved}
                  onCheckedChange={(checked) => setIsApproved(checked === true)}
                />
                <Label htmlFor="approved" className="text-sm cursor-pointer">
                  Aprovat
                </Label>
              </div>
            </div>
          )}

          {/* Approval checkbox for vacances */}
          {absenceType === 'vacances' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="approvedVacances"
                checked={isApproved}
                onCheckedChange={(checked) => setIsApproved(checked === true)}
              />
              <Label htmlFor="approvedVacances" className="text-sm cursor-pointer">
                Aprovat
              </Label>
            </div>
          )}

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm space-y-1">
              <p>Hores totals: <strong>{formatHoursMinutes(totalWorkedHours)}</strong></p>
              <p className={difference >= 0 ? 'text-[hsl(var(--status-complete))]' : 'text-[hsl(var(--status-deficit))]'}>
                Diferència: <strong>{difference >= 0 ? '+' : '-'}{formatHoursMinutes(difference)}</strong>
              </p>
            </div>
          </div>
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
