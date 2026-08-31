const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Monday (00:00 local) of the week containing `date`. */
export const weekStart = (date: Date): Date => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNum = (d.getDay() + 6) % 7; // Mon = 0 … Sun = 6
  d.setDate(d.getDate() - dayNum);
  return d;
};

/** ISO-8601 week number (weeks start on Monday, week 1 holds the first Thursday). */
export const isoWeek = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  return 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * DAY_MS));
};

/** Shift a week-start Monday by `n` weeks (negative = earlier). */
export const addWeeks = (monday: Date, n: number): Date =>
  new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + n * 7);

/** e.g. "Aug 31 – Sep 05" — Monday through Saturday of the week. */
export const formatWeekRange = (monday: Date): string => {
  const end = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 5);
  const fmt = (d: Date) => `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
  return `${fmt(monday)} – ${fmt(end)}`;
};

/** True when the ISO date string falls within the Mon–Sun week starting at `monday`. */
export const isInWeek = (iso: string | null | undefined, monday: Date): boolean => {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const start = monday.getTime();
  return d.getTime() >= start && d.getTime() < start + 7 * DAY_MS;
};
