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
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Plane className="w-4 h-4 text-[hsl(var(--status-vacation))]" />
            Vacances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {config.totalVacationDays - config.usedVacationDays}
            <span className="text-sm font-normal text-muted-foreground"> dies disponibles</span>
          </div>
          <Progress value={vacationProgress} className="mt-2 h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {config.usedVacationDays} de {config.totalVacationDays} dies utilitzats
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Assumptes Propis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(config.totalAPHours - config.usedAPHours).toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground"> hores disponibles</span>
          </div>
          <Progress value={apProgress} className="mt-2 h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {config.usedAPHours.toFixed(1)} de {config.totalAPHours} hores utilitzades
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[hsl(var(--status-complete))]" />
            Flexibilitat Horària
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {config.flexibilityHours.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground"> hores acumulades</span>
          </div>
          <Progress value={flexProgress} className="mt-2 h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Màxim 25 hores acumulables
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
