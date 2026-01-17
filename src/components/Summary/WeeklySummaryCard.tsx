import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, Target } from 'lucide-react';
import type { WeeklySummary } from '@/types';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface WeeklySummaryCardProps {
  summary: WeeklySummary;
  isCurrentWeek: boolean;
}

export function WeeklySummaryCard({ summary, isCurrentWeek }: WeeklySummaryCardProps) {
  const isPositive = summary.difference >= 0;

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      isCurrentWeek && 'ring-2 ring-primary'
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Setmana {summary.weekNumber}
          </CardTitle>
          {isCurrentWeek && (
            <Badge variant="default" className="text-xs">Actual</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {format(parseISO(summary.startDate), 'd/MM')} - {format(parseISO(summary.endDate), 'd/MM')}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Teòriques</span>
          </div>
          <span className="font-medium">{summary.theoreticalHours}h</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Treballades</span>
          </div>
          <span className="font-medium">{summary.workedHours.toFixed(1)}h</span>
        </div>

        <div className={cn(
          'flex items-center justify-between p-2 rounded-md text-sm',
          isPositive 
            ? 'bg-[hsl(var(--status-complete)/0.1)] text-[hsl(var(--status-complete))]' 
            : 'bg-[hsl(var(--status-deficit)/0.1)] text-[hsl(var(--status-deficit))]'
        )}>
          <div className="flex items-center gap-1.5">
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>Diferència</span>
          </div>
          <span className="font-bold">
            {isPositive ? '+' : ''}{summary.difference.toFixed(1)}h
          </span>
        </div>

        {summary.flexibilityGained > 0 && (
          <div className="text-xs text-primary flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +{summary.flexibilityGained.toFixed(1)}h de flexibilitat acumulada
          </div>
        )}
      </CardContent>
    </Card>
  );
}
