import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { ca } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarDay } from './CalendarDay';
import { DayDetailDialog } from './DayDetailDialog';
import { MONTH_NAMES_CA, DAY_NAMES_CA } from '@/lib/constants';
import type { DayData, UserConfig } from '@/types';

interface CalendarGridProps {
  daysData: Record<string, DayData>;
  config: UserConfig;
  onDayUpdate: (dayData: DayData) => void;
}

export function CalendarGrid({ daysData, config, onDayUpdate }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const goToPreviousMonth = () => {
    const newDate = subMonths(currentDate, 1);
    if (newDate.getFullYear() >= 2026) {
      setCurrentDate(newDate);
    }
  };

  const goToNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    if (newDate.getFullYear() <= 2026) {
      setCurrentDate(newDate);
    }
  };

  const weekDayHeaders = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];

  return (
    <div className="bg-card rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPreviousMonth}
          disabled={currentDate.getMonth() === 0 && currentDate.getFullYear() === 2026}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-2xl font-bold text-foreground">
          {MONTH_NAMES_CA[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <Button
          variant="outline"
          size="icon"
          onClick={goToNextMonth}
          disabled={currentDate.getMonth() === 11 && currentDate.getFullYear() === 2026}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDayHeaders.map((day, index) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          return (
            <CalendarDay
              key={dateStr}
              date={day}
              dayData={daysData[dateStr] || null}
              config={config}
              isCurrentMonth={isSameMonth(day, currentDate)}
              isToday={isToday(day)}
              onClick={() => setSelectedDate(day)}
            />
          );
        })}
      </div>

      <DayDetailDialog
        date={selectedDate}
        dayData={selectedDate ? daysData[format(selectedDate, 'yyyy-MM-dd')] || null : null}
        config={config}
        onClose={() => setSelectedDate(null)}
        onSave={onDayUpdate}
      />
    </div>
  );
}
