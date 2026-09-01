const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DAY_MS = 24 * 60 * 60 * 1000;

export const weekStart = (date: Date): Date => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const mondayOffset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - mondayOffset);
  return d;
};

export const isoWeek = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const mondayOffset = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - mondayOffset + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstOffset = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstOffset + 3);
  return 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * DAY_MS));
};

export const addWeeks = (monday: Date, weeks: number): Date =>
  new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + weeks * 7);

export const formatWeekRange = (monday: Date): string => {
  const end = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 5);
  const label = (d: Date) => `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
  return `${label(monday)} – ${label(end)}`;
};

export const isInWeek = (iso: string | null | undefined, monday: Date): boolean => {
  if (!iso) return false;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  const start = monday.getTime();
  return date.getTime() >= start && date.getTime() < start + 7 * DAY_MS;
};
