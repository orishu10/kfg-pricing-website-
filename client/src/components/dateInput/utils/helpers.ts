import type { SxProps, Theme } from '@mui/material/styles';
import {
  CALENDAR_CELL_COUNT, MONTH_FULL_LABELS, MONTH_LABELS, YEAR_PAGE_SIZE,
  type CalendarOption, type CalendarView,
} from './consts';

const pad = (value: number) => String(value).padStart(2, '0');

export const parseIsoDate = (value: string): Date | null => {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const formatDisplayDate = (value: string): string => {
  const date = parseIsoDate(value);
  if (!date) return '';
  return `${pad(date.getDate())} ${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
};

export const startOfToday = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

export const addMonths = (date: Date, months: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + months, 1);

export const addYears = (date: Date, years: number): Date =>
  new Date(date.getFullYear() + years, date.getMonth(), 1);

export const isSameDay = (first: Date, second: Date): boolean =>
  first.getFullYear() === second.getFullYear()
  && first.getMonth() === second.getMonth()
  && first.getDate() === second.getDate();

export const buildCalendarDays = (month: Date): Date[] => {
  const first = startOfMonth(month);
  const leadingDays = (first.getDay() + 6) % 7;
  return Array.from({ length: CALENDAR_CELL_COUNT }, (_, index) =>
    new Date(first.getFullYear(), first.getMonth(), 1 - leadingDays + index));
};

const buildYearPage = (year: number): number[] => {
  const start = year - (((year % YEAR_PAGE_SIZE) + YEAR_PAGE_SIZE) % YEAR_PAGE_SIZE);
  return Array.from({ length: YEAR_PAGE_SIZE }, (_, index) => start + index);
};

export const stepMonth = (month: Date, view: CalendarView, direction: number): Date => {
  if (view === 'days') return addMonths(month, direction);
  if (view === 'months') return addYears(month, direction);
  return addYears(month, direction * YEAR_PAGE_SIZE);
};

export const calendarTitle = (month: Date, view: CalendarView): string => {
  if (view === 'days') return `${MONTH_FULL_LABELS[month.getMonth()]} ${month.getFullYear()}`;
  if (view === 'months') return String(month.getFullYear());
  const years = buildYearPage(month.getFullYear());
  return `${years[0]} – ${years[years.length - 1]}`;
};

export const monthOptions = (month: Date, selected: Date | null): CalendarOption[] =>
  MONTH_LABELS.map((label, index) => ({
    label,
    value: index,
    selected: selected !== null
      && selected.getFullYear() === month.getFullYear()
      && selected.getMonth() === index,
  }));

export const yearOptions = (month: Date, selected: Date | null): CalendarOption[] =>
  buildYearPage(month.getFullYear()).map((year) => ({
    label: String(year),
    value: year,
    selected: selected !== null && selected.getFullYear() === year,
  }));

export const mergeSx = (...values: (SxProps<Theme> | undefined)[]): SxProps<Theme> =>
  values.flatMap((value) => (value ? (Array.isArray(value) ? value : [value]) : [])) as SxProps<Theme>;
