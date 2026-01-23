import { Button } from '@/components/ui/button';
import { Legend } from '@/components/Legend';
import { StatusSummary } from '@/components/Summary/StatusSummary';
import { Settings, Clock } from 'lucide-react';
import type { DayData, UserConfig } from '@/types';

interface HeaderProps {
  config: UserConfig;
  daysData: Record<string, DayData>;
  onOpenSettings: () => void;
}

export function Header({ config, daysData, onOpenSettings }: HeaderProps) {
  const userName = config.firstName 
    ? config.firstName
    : 'Usuari';

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Control horari</h1>
                <p className="text-sm text-muted-foreground">
                  {userName} · {config.calendarYear}
                </p>
              </div>
            </div>
            <StatusSummary config={config} daysData={daysData} variant="compact" />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onOpenSettings}
              aria-label="Configuració"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Legend />
          </div>
        </div>
      </div>
    </header>
  );
}
