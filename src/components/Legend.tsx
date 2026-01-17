import { Home, Building2, Plane, Clock, Sparkles, Calendar } from 'lucide-react';

export function Legend() {
  return (
    <div className="bg-card rounded-xl shadow-lg p-4">
      <h3 className="text-sm font-semibold mb-3 text-foreground">Llegenda</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
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
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Presencial</span>
        </div>
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Teletreball</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[hsl(var(--status-weekend))]" />
          <span className="text-muted-foreground">Cap de setmana</span>
        </div>
      </div>
    </div>
  );
}
