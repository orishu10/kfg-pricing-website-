export type CalendarView = 'days' | 'months' | 'years';

export interface CalendarOption {
  label: string;
  value: number;
  selected: boolean;
}

export const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as const;

export const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export const MONTH_FULL_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

export const CALENDAR_CELL_COUNT = 42;

export const YEAR_PAGE_SIZE = 12;

export const NEXT_CALENDAR_VIEW: Record<CalendarView, CalendarView> = {
  days: 'months',
  months: 'years',
  years: 'days',
};

export const OPEN_CALENDAR_KEYS = ['Enter', ' ', 'ArrowDown'];

export const CALENDAR_PAPER_SX = {
  mt: 0.75,
  p: 1.5,
  width: 288,
  borderRadius: 3,
  border: '1px solid rgba(0,0,0,0.08)',
  boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
} as const;

export const CALENDAR_HEADER_SX = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  mb: 1,
} as const;

export const CALENDAR_TITLE_BUTTON_SX = { px: 1, py: 0.25, borderRadius: 2 } as const;

export const CALENDAR_TITLE_SX = { fontSize: '0.85rem', fontWeight: 700 } as const;

export const CALENDAR_FOOTER_SX = {
  display: 'flex',
  justifyContent: 'space-between',
  mt: 1,
  pt: 1,
  borderTop: '1px solid rgba(0,0,0,0.08)',
} as const;

export const DAY_GRID_SX = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: 0.25,
} as const;

export const OPTION_GRID_SX = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 0.5,
} as const;

export const WEEKDAY_LABEL_SX = {
  textAlign: 'center',
  fontSize: '0.68rem',
  fontWeight: 700,
  color: 'text.secondary',
} as const;

export const CALENDAR_CELL_SX = {
  height: 34,
  borderRadius: 2,
  fontSize: '0.8rem',
  fontWeight: 500,
  transition: 'background-color 120ms ease, color 120ms ease',
  '&:hover': { bgcolor: 'rgba(193,29,40,0.08)' },
} as const;

export const OPTION_CELL_SX = { ...CALENDAR_CELL_SX, height: 40 } as const;

export const SELECTED_CELL_SX = {
  bgcolor: 'primary.main',
  color: 'primary.contrastText',
  '&:hover': { bgcolor: 'primary.dark' },
} as const;

export const TODAY_CELL_SX = { boxShadow: 'inset 0 0 0 1px rgba(193,29,40,0.55)' } as const;

export const CLEAR_DATE_BUTTON_SX = { color: 'text.secondary', mr: -0.5 } as const;

export const CLEAR_DATE_ICON_SX = { fontSize: '0.95rem' } as const;

export const CALENDAR_ICON_SX = { fontSize: '1.1rem', color: 'text.secondary' } as const;
