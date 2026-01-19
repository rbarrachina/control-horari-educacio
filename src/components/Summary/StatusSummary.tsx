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
        <CardHeader className="pb-2 space-y-1">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Plane className="w-4 h-4 text-[hsl(var(--status-vacation))]" />
              Vacances
            </CardTitle>
            <div className="text-base font-semibold">
              {config.totalVacationDays - config.usedVacationDays}
              <span className="text-sm font-normal text-muted-foreground"> dies</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {config.usedVacationDays} de {config.totalVacationDays} dies utilitzats
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <Progress value={vacationProgress} className="h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 space-y-1">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Assumptes Propis
            </CardTitle>
            <div className="text-base font-semibold">
              {(config.totalAPHours - config.usedAPHours).toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground"> hores</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {config.usedAPHours.toFixed(1)} de {config.totalAPHours} hores utilitzades
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <Progress value={apProgress} className="h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 space-y-1">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[hsl(var(--status-complete))]" />
              Flexibilitat Horària
            </CardTitle>
            <div className="text-base font-semibold">
              {config.flexibilityHours.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground"> hores</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            FX solicitades amb validació
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <Progress value={flexProgress} className="h-2" />
        </CardContent>
      </Card>
    </div>
  );
}
