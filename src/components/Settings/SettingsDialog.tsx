import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Download, Upload, Trash2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { UserConfig, DayType, SchedulePeriod, ScheduleType } from '@/types';
import { DAYS_OF_WEEK, DAY_NAMES_CA, MONTH_NAMES_CA, SCHEDULE_HOURS } from '@/lib/constants';
import { format, parseISO, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { exportAllData, importAllData, resetAllData, type ExportData } from '@/lib/storage';
import { safeValidateExportData, MAX_IMPORT_FILE_SIZE } from '@/lib/validation';
import { toast } from 'sonner';

interface SettingsDialogProps {
  open: boolean;
  config: UserConfig;
  onClose: () => void;
  onSave: (config: UserConfig) => void;
  onDataReset?: () => void;
}

export function SettingsDialog({ open, config, onClose, onSave, onDataReset }: SettingsDialogProps) {
  const [localConfig, setLocalConfig] = useState<UserConfig>(config);
  const [newHoliday, setNewHoliday] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  // Validate that all days of 2026 are covered by schedule periods
  const validateScheduleCoverage = (periods: SchedulePeriod[]): { isValid: boolean; missingDays: number } => {
    const yearStart = new Date(2026, 0, 1);
    const yearEnd = new Date(2026, 11, 31);
    const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });
    
    let coveredDays = 0;
    allDays.forEach(day => {
      for (const period of periods) {
        const start = parseISO(period.startDate);
        const end = parseISO(period.endDate);
        if (isWithinInterval(day, { start, end })) {
          coveredDays++;
          break;
        }
      }
    });
    
    return {
      isValid: coveredDays === allDays.length,
      missingDays: allDays.length - coveredDays,
    };
  };

  const sortSchedulePeriods = (periods: SchedulePeriod[]): SchedulePeriod[] =>
    [...periods].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const sortedSchedulePeriods = sortSchedulePeriods(localConfig.schedulePeriods);
  const scheduleValidation = validateScheduleCoverage(sortedSchedulePeriods);

  const handleSave = () => {
    onSave({ ...localConfig, schedulePeriods: sortedSchedulePeriods });
    onClose();
  };

  const updateWeeklyConfig = (day: keyof typeof localConfig.weeklyConfig, value: DayType) => {
    setLocalConfig(prev => ({
      ...prev,
      weeklyConfig: {
        ...prev.weeklyConfig,
        [day]: {
          dayType: value,
        },
      },
    }));
  };

  const updateSchedulePeriod = (id: string, field: 'startDate' | 'endDate' | 'scheduleType', value: string) => {
    setLocalConfig(prev => {
      const periodIndex = prev.schedulePeriods.findIndex(p => p.id === id);
      if (periodIndex === -1) return prev;

      const updatedPeriod = { ...prev.schedulePeriods[periodIndex] };

      if (field === 'scheduleType') {
        updatedPeriod.scheduleType = value as ScheduleType;
      } else {
        updatedPeriod[field] = value;
        if (field === 'startDate' && updatedPeriod.startDate > updatedPeriod.endDate) {
          updatedPeriod.endDate = updatedPeriod.startDate;
        }
        if (field === 'endDate' && updatedPeriod.endDate < updatedPeriod.startDate) {
          updatedPeriod.startDate = updatedPeriod.endDate;
        }
      }

      const updatedPeriods = [...prev.schedulePeriods];
      updatedPeriods[periodIndex] = updatedPeriod;
      return { ...prev, schedulePeriods: sortSchedulePeriods(updatedPeriods) };
    });
  };

  const addSchedulePeriod = () => {
    setLocalConfig(prev => {
      const sorted = sortSchedulePeriods(prev.schedulePeriods);
      const yearEnd = '2026-12-31';
      const lastPeriod = sorted[sorted.length - 1];
      const lastEndDate = lastPeriod ? parseISO(lastPeriod.endDate) : parseISO('2026-01-01');
      if (lastPeriod && lastPeriod.endDate >= yearEnd) {
        return prev;
      }
      const nextStartDate = new Date(lastEndDate);
      nextStartDate.setDate(nextStartDate.getDate() + 1);
      const nextType: ScheduleType = lastPeriod?.scheduleType === 'estiu' ? 'hivern' : 'estiu';
      const newPeriod: SchedulePeriod = {
        id: `period-${Date.now()}`,
        startDate: format(nextStartDate, 'yyyy-MM-dd'),
        endDate: yearEnd,
        scheduleType: nextType,
      };
      return { ...prev, schedulePeriods: [...sorted, newPeriod] };
    });
  };

  const removeSchedulePeriod = (id: string) => {
    setLocalConfig(prev => {
      const remaining = prev.schedulePeriods.filter(period => period.id !== id);
      if (remaining.length === 0) {
        return prev;
      }
      return { ...prev, schedulePeriods: sortSchedulePeriods(remaining) };
    });
  };

  const addHoliday = () => {
    if (newHoliday && !localConfig.holidays.includes(newHoliday)) {
      setLocalConfig(prev => ({
        ...prev,
        holidays: [...prev.holidays, newHoliday].sort(),
      }));
      setNewHoliday('');
    }
  };

  const removeHoliday = (holiday: string) => {
    setLocalConfig(prev => ({
      ...prev,
      holidays: prev.holidays.filter(h => h !== holiday),
    }));
  };

  // Sort holidays by date
  const sortedHolidays = [...localConfig.holidays].sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `control-horari-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Dades exportades correctament');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size limit
    if (file.size > MAX_IMPORT_FILE_SIZE) {
      toast.error(`El fitxer és massa gran. Màxim: ${MAX_IMPORT_FILE_SIZE / 1024 / 1024}MB`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rawData = JSON.parse(e.target?.result as string);
        
        // Validate data against schema
        const validationResult = safeValidateExportData(rawData);
        
        if (!validationResult.success) {
          toast.error('error' in validationResult ? validationResult.error : 'Dades invàlides');
          return;
        }
        
        // Data is now validated, safe to import
        if (importAllData(validationResult.data as ExportData)) {
          toast.success('Dades importades correctament. Recarregant...');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          toast.error('Error important les dades');
        }
      } catch (error) {
        if (error instanceof SyntaxError) {
          toast.error('El fitxer no és un JSON vàlid');
        } else {
          toast.error('Error llegint el fitxer');
        }
      }
    };
    reader.onerror = () => {
      toast.error('Error llegint el fitxer');
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    resetAllData();
    toast.success('Dades esborrades. Recarregant...');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Configuració</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="schedule">Horari</TabsTrigger>
            <TabsTrigger value="holidays">Festius</TabsTrigger>
            <TabsTrigger value="data">Dades</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nom</Label>
                <Input
                  id="firstName"
                  value={localConfig.firstName}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="El teu nom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Cognoms</Label>
                <Input
                  id="lastName"
                  value={localConfig.lastName}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Els teus cognoms"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vacationDays">Dies de vacances totals</Label>
                <Input
                  id="vacationDays"
                  type="number"
                  value={localConfig.totalVacationDays}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, totalVacationDays: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apHours">Hores d'AP totals</Label>
                <Input
                  id="apHours"
                  type="number"
                  value={localConfig.totalAPHours}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, totalAPHours: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 pt-4">
            <div className="grid gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="defaultStart">Hora d'inici per defecte</Label>
                <Input
                  id="defaultStart"
                  type="time"
                  value={localConfig.defaultStartTime}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, defaultStartTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Configuració setmanal (Presencial / Teletreball)</Label>
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <span className="font-medium w-24">{DAY_NAMES_CA[day]}</span>
                  <Select
                    value={localConfig.weeklyConfig[day].dayType}
                    onValueChange={(v) => updateWeeklyConfig(day, v as DayType)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="teletreball">Teletreball</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Franges horàries (Estiu / Hivern)</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Estiu: {SCHEDULE_HOURS.estiu}h/dia | Hivern: {SCHEDULE_HOURS.hivern}h/dia
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addSchedulePeriod}
                  disabled={sortedSchedulePeriods[sortedSchedulePeriods.length - 1]?.endDate >= '2026-12-31'}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Afegir franja
                </Button>
              </div>

              {!scheduleValidation.isValid && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Falten {scheduleValidation.missingDays} dies per definir!</span>
                </div>
              )}

              <div className="space-y-2">
                {sortedSchedulePeriods.map((period) => (
                  <div key={period.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg flex-wrap">
                    <Select
                      value={period.scheduleType}
                      onValueChange={(v) => updateSchedulePeriod(period.id, 'scheduleType', v)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hivern">Hivern</SelectItem>
                        <SelectItem value="estiu">Estiu</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">de</span>
                    <Input
                      type="date"
                      className="w-36"
                      value={period.startDate}
                      onChange={(e) => updateSchedulePeriod(period.id, 'startDate', e.target.value)}
                      min="2026-01-01"
                      max="2026-12-31"
                    />
                    <span className="text-sm text-muted-foreground">a</span>
                    <Input
                      type="date"
                      className="w-36"
                      value={period.endDate}
                      onChange={(e) => updateSchedulePeriod(period.id, 'endDate', e.target.value)}
                      min="2026-01-01"
                      max="2026-12-31"
                    />
                    <span className="text-muted-foreground text-sm ml-auto">
                      ({SCHEDULE_HOURS[period.scheduleType]}h/dia)
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeSchedulePeriod(period.id)}
                      disabled={sortedSchedulePeriods.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="holidays" className="space-y-4 pt-4">
            <div className="flex gap-2">
              <Input
                type="date"
                value={newHoliday}
                onChange={(e) => setNewHoliday(e.target.value)}
                min="2026-01-01"
                max="2026-12-31"
              />
              <Button onClick={addHoliday} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sortedHolidays.map((holiday) => {
                const date = parseISO(holiday);
                return (
                  <div key={holiday} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <span>
                      {format(date, 'd')} de {MONTH_NAMES_CA[date.getMonth()]}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeHoliday(holiday)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-6 pt-4">
            {/* Privacy Notice */}
            <div className="flex gap-3 p-3 bg-muted/50 rounded-lg border">
              <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Avís de privacitat</p>
                <p>
                  Totes les dades es guarden localment al teu navegador (localStorage). 
                  No s'envien a cap servidor extern. Fes còpies de seguretat regularment 
                  i esborra les dades si fas servir un ordinador compartit.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Exportar dades</h3>
              <p className="text-sm text-muted-foreground">
                Descarrega totes les dades en un fitxer JSON per fer còpia de seguretat.
              </p>
              <Button onClick={handleExport} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Exportar dades
              </Button>
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="text-lg font-semibold">Importar dades</h3>
              <p className="text-sm text-muted-foreground">
                Carrega un fitxer JSON exportat anteriorment (màxim 5MB). Això sobreescriurà les dades actuals.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar dades
              </Button>
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="text-lg font-semibold text-destructive">Reset complet</h3>
              <p className="text-sm text-muted-foreground">
                Esborra totes les dades i comença des de zero. Aquesta acció és irreversible.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Esborrar totes les dades
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      Estàs segur?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Aquesta acció esborrarà totes les dades de configuració i registres horaris.
                      No es pot desfer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Sí, esborrar tot
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel·lar
          </Button>
          <Button onClick={handleSave}>
            Desar canvis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
