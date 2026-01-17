export type DayType = 'presencial' | 'teletreball';
export type DayStatus = 'laboral' | 'festiu' | 'vacances' | 'assumpte_propi' | 'flexibilitat';
export type RequestStatus = 'pendent' | 'aprovat' | null;

export interface DayData {
  date: string; // YYYY-MM-DD
  theoreticalHours: number;
  startTime: string | null; // HH:mm
  endTime: string | null; // HH:mm
  dayType: DayType;
  dayStatus: DayStatus;
  requestStatus: RequestStatus;
  apHours?: number; // Hours used for assumptes propis
  flexHours?: number; // Hours used from flexibility
  notes?: string;
}

export interface WeeklyConfig {
  monday: { dayType: DayType; theoreticalHours: number };
  tuesday: { dayType: DayType; theoreticalHours: number };
  wednesday: { dayType: DayType; theoreticalHours: number };
  thursday: { dayType: DayType; theoreticalHours: number };
  friday: { dayType: DayType; theoreticalHours: number };
}

export interface UserConfig {
  firstName: string;
  lastName: string;
  defaultStartTime: string;
  defaultEndTime: string;
  weeklyConfig: WeeklyConfig;
  totalVacationDays: number;
  usedVacationDays: number;
  totalAPHours: number;
  usedAPHours: number;
  flexibilityHours: number; // Current accumulated (max 25)
  holidays: string[]; // Array of YYYY-MM-DD
}

export interface WeeklySummary {
  weekNumber: number;
  startDate: string;
  endDate: string;
  theoreticalHours: number;
  workedHours: number;
  difference: number;
  flexibilityGained: number;
}
