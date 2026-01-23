import { useState } from 'react';
import { Header } from '@/components/Header';
import { CalendarGrid } from '@/components/Calendar/CalendarGrid';
import { SettingsDialog } from '@/components/Settings/SettingsDialog';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { config, daysData, isLoading, updateConfig, updateDayData } = useTimeTracking();
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-[500px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        config={config}
        daysData={daysData}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <CalendarGrid
          daysData={daysData}
          config={config}
          onDayUpdate={updateDayData}
        />
        
      </main>

      <SettingsDialog
        open={settingsOpen}
        config={config}
        onClose={() => setSettingsOpen(false)}
        onSave={updateConfig}
      />
    </div>
  );
};

export default Index;
