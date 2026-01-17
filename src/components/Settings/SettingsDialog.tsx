import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import type { UserConfig, DayType } from '@/types';
import { DAYS_OF_WEEK, DAY_NAMES_CA, MONTH_NAMES_CA } from '@/lib/constants';
import { format, parseISO } from 'date-fns';

interface SettingsDialogProps {
  open: boolean;
  config: UserConfig;
  onClose: () => void;
  onSave: (config: UserConfig) => void;
}

export function SettingsDialog({ open, config, onClose, onSave }: SettingsDialogProps) {
  const [localConfig, setLocalConfig] = useState<UserConfig>(config);
  const [newHoliday, setNewHoliday] = useState('');

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  const updateWeeklyConfig = (day: keyof typeof localConfig.weeklyConfig, field: 'dayType' | 'theoreticalHours', value: string | number) => {
    setLocalConfig(prev => ({
      ...prev,
      weeklyConfig: {
        ...prev.weeklyConfig,
        [day]: {
          ...prev.weeklyConfig[day],
          [field]: field === 'theoreticalHours' ? parseFloat(value as string) || 0 : value,
        },
      },
    }));
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Configuració</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="schedule">Horari</TabsTrigger>
            <TabsTrigger value="holidays">Festius</TabsTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="flexibility">Flexibilitat acumulada (hores)</Label>
              <Input
                id="flexibility"
                type="number"
                step="0.5"
                max="25"
                min="0"
                value={localConfig.flexibilityHours}
                onChange={(e) => setLocalConfig(prev => ({ 
                  ...prev, 
                  flexibilityHours: Math.min(25, Math.max(0, parseFloat(e.target.value) || 0))
                }))}
              />
              <p className="text-xs text-muted-foreground">Màxim 25 hores</p>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="defaultStart">Hora d'inici per defecte</Label>
                <Input
                  id="defaultStart"
                  type="time"
                  value={localConfig.defaultStartTime}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, defaultStartTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultEnd">Hora de fi per defecte</Label>
                <Input
                  id="defaultEnd"
                  type="time"
                  value={localConfig.defaultEndTime}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, defaultEndTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Configuració setmanal</Label>
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <span className="font-medium w-24">{DAY_NAMES_CA[day]}</span>
                  <Select
                    value={localConfig.weeklyConfig[day].dayType}
                    onValueChange={(v) => updateWeeklyConfig(day, 'dayType', v)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="teletreball">Teletreball</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      max="12"
                      className="w-20"
                      value={localConfig.weeklyConfig[day].theoreticalHours}
                      onChange={(e) => updateWeeklyConfig(day, 'theoreticalHours', e.target.value)}
                    />
                    <span className="text-sm text-muted-foreground">hores</span>
                  </div>
                </div>
              ))}
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
              {localConfig.holidays.sort().map((holiday) => {
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
