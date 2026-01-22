import { Home, Building2, Plane, Clock, Sparkles, Calendar, Check, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export function Legend() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="icon" aria-label="Llegenda">
          <Info className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <h3 className="text-sm font-semibold mb-3 text-foreground">Llegenda</h3>
        <div className="space-y-4 text-sm">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Colors</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[hsl(var(--status-weekday-empty))]" />
                <span className="text-muted-foreground">Sense dades</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[hsl(var(--status-pending))]" />
                <span className="text-muted-foreground">Pendent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[hsl(var(--status-deficit))]" />
                <span className="text-muted-foreground">Dèficit d'hores</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[hsl(var(--status-complete))]" />
                <span className="text-muted-foreground">Hores complertes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[hsl(var(--status-holiday))]" />
                <span className="text-muted-foreground">Festiu</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[hsl(var(--status-vacation))]" />
                <span className="text-muted-foreground">Vacances</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[hsl(var(--status-weekend))]" />
                <span className="text-muted-foreground">Cap de setmana</span>
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Símbols</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Presencial</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Teletreball</span>
              </div>
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Vacances</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Assumpte propi</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Flexibilitat</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Festiu</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Aprovat</span>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
