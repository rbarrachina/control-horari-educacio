// Barcelona public holidays 2026
export const BARCELONA_HOLIDAYS_2026 = [
  '2026-01-01', // Cap d'Any
  '2026-01-06', // Reis
  '2026-04-03', // Divendres Sant
  '2026-04-06', // Dilluns de Pasqua
  '2026-05-01', // Festa del Treball
  '2026-06-24', // Sant Joan
  '2026-08-15', // L'Assumpció
  '2026-09-11', // Diada de Catalunya
  '2026-09-24', // La Mercè
  '2026-10-12', // Festa Nacional d'Espanya
  '2026-11-01', // Tots Sants
  '2026-12-08', // La Immaculada
  '2026-12-25', // Nadal
  '2026-12-26', // Sant Esteve
];

export const DEFAULT_CALENDAR_YEAR = 2026;

export const DEFAULT_USER_CONFIG = {
  calendarYear: DEFAULT_CALENDAR_YEAR,
  firstName: '',
  defaultStartTime: '07:30',
  defaultEndTime: '15:00',
  weeklyConfig: {
    monday: { dayType: 'presencial' as const },
    tuesday: { dayType: 'presencial' as const },
    wednesday: { dayType: 'presencial' as const },
    thursday: { dayType: 'teletreball' as const },
    friday: { dayType: 'teletreball' as const },
  },
  schedulePeriods: [
    {
      id: 'default-winter',
      startDate: `${DEFAULT_CALENDAR_YEAR}-01-01`,
      endDate: `${DEFAULT_CALENDAR_YEAR}-12-31`,
      scheduleType: 'estiu' as const,
    },
  ],
  totalVacationDays: 25,
  usedVacationDays: 0,
  totalAPHours: 90,
  usedAPHours: 0,
  flexibilityHours: 0,
  usedFlexHours: 0,
  holidays: BARCELONA_HOLIDAYS_2026,
};

export const SCHEDULE_HOURS = {
  hivern: 7.5,
  estiu: 7,
};

export const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

export const DAY_NAMES_CA: Record<string, string> = {
  monday: 'Dilluns',
  tuesday: 'Dimarts',
  wednesday: 'Dimecres',
  thursday: 'Dijous',
  friday: 'Divendres',
  saturday: 'Dissabte',
  sunday: 'Diumenge',
};

export const MONTH_NAMES_CA = [
  'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
  'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'
];

export const MAX_FLEXIBILITY_HOURS = 25;
export const MIN_WEEKLY_SURPLUS_FOR_FLEXIBILITY = 0.5; // 30 minutes

export const APP_INFO = {
  name: 'Σ Horari',
  author: 'Rafa Barrachina',
  license: 'Apache License 2.0',
  year: 2026,
  version: '1.1',
};
