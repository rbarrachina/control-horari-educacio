import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Plane, Clock, Sparkles, Calendar } from 'lucide-react';
import type { UserConfig } from '@/types';

interface StatusSummaryProps {
  config: UserConfig;
}

export function StatusSummary({ config }: StatusSummaryProps) {
  const vacationProgress = (config.usedVacationDays / config.totalVacationDays) * 100;
  const apProgress = (config.usedAPHours / config.totalAPHours) * 100;
  const flexProgress = (config.flexibilityHours / 25) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Plane className="w-4 h-4 text-[hsl(var(--status-vacation))]" />
            Vacances
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold leading-tight">
            {config.totalVacationDays - config.usedVacationDays}
            <span className="text-sm font-normal text-muted-foreground"> dies disponibles</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Progress value={vacationProgress} className="h-2 flex-1" />
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              {config.usedVacationDays} de {config.totalVacationDays} dies utilitzats
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Assumptes Propis
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold leading-tight">
            {(config.totalAPHours - config.usedAPHours).toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground"> hores disponibles</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Progress value={apProgress} className="h-2 flex-1" />
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              {config.usedAPHours.toFixed(1)} de {config.totalAPHours} hores utilitzades
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[hsl(var(--status-complete))]" />
            Flexibilitat Horària
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold leading-tight">
            {config.flexibilityHours.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground"> hores acumulades</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Progress value={flexProgress} className="h-2 flex-1" />
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              Màxim 25 hores acumulables
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
