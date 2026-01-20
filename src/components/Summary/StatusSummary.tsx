import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Plane, Clock, Sparkles } from 'lucide-react';
import type { UserConfig } from '@/types';

interface StatusSummaryProps {
  config: UserConfig;
  variant?: 'default' | 'compact';
}

export function StatusSummary({ config, variant = 'default' }: StatusSummaryProps) {
  const formatDuration = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    let minutes = Math.round((hours % 1) * 60);
    let adjustedHours = wholeHours;
    if (minutes === 60) {
      adjustedHours += 1;
      minutes = 0;
    }
    if (adjustedHours > 0 && minutes > 0) {
      return `${adjustedHours}h ${minutes}min`;
    }
    if (adjustedHours > 0) {
      return `${adjustedHours}h`;
    }
    return `${minutes} min`;
  };

  const vacationProgress = (config.usedVacationDays / config.totalVacationDays) * 100;
  const apProgress = (config.usedAPHours / config.totalAPHours) * 100;
  const flexProgress = (config.flexibilityHours / 25) * 100;
  const remainingAPHours = Math.max(0, config.totalAPHours - config.usedAPHours);
  const summaryItems = [
    {
      key: 'vacances',
      label: 'Vacances',
      icon: Plane,
      iconClassName: 'text-[hsl(var(--status-vacation))]',
      value: (config.totalVacationDays - config.usedVacationDays).toString(),
      unit: 'dies',
      detail: `${config.usedVacationDays} de ${config.totalVacationDays} dies utilitzats`,
      progress: vacationProgress,
    },
    {
      key: 'ap',
      label: 'Assumptes Propis',
      icon: Clock,
      iconClassName: 'text-primary',
      value: formatDuration(remainingAPHours),
      unit: '',
      detail: `${formatDuration(config.usedAPHours)} de ${formatDuration(config.totalAPHours)} utilitzades`,
      progress: apProgress,
    },
    {
      key: 'fx',
      label: 'Flexibilitat Horària',
      icon: Sparkles,
      iconClassName: 'text-[hsl(var(--status-complete))]',
      value: formatDuration(config.flexibilityHours),
      unit: '',
      detail: 'FX solicitades amb validació',
      progress: flexProgress,
    },
  ];

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {summaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className="flex items-center gap-3 rounded-lg border border-border bg-card/60 px-3 py-2 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${item.iconClassName}`} />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
              <div className="text-sm font-semibold text-foreground">
                {item.value}
                {item.unit && (
                  <span className="text-xs font-normal text-muted-foreground"> {item.unit}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {summaryItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.key}>
            <CardHeader className="pb-2 space-y-1">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${item.iconClassName}`} />
                  {item.label}
                </CardTitle>
                <div className="text-base font-semibold">
                  {item.value}
                  {item.unit && (
                    <span className="text-sm font-normal text-muted-foreground"> {item.unit}</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <Progress value={item.progress} className="h-2" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
