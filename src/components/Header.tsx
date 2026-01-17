import { Button } from '@/components/ui/button';
import { Settings, Calendar, Clock } from 'lucide-react';
import type { UserConfig } from '@/types';

interface HeaderProps {
  config: UserConfig;
  onOpenSettings: () => void;
}

export function Header({ config, onOpenSettings }: HeaderProps) {
  const userName = config.firstName 
    ? `${config.firstName} ${config.lastName}`.trim()
    : 'Usuari';

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Clock className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Control Horari</h1>
              <p className="text-sm text-muted-foreground">
                {userName} · Any 2026
              </p>
            </div>
          </div>
          
          <Button variant="outline" onClick={onOpenSettings} className="gap-2">
            <Settings className="w-4 h-4" />
            Configuració
          </Button>
        </div>
      </div>
    </header>
  );
}
