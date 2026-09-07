const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export const timeAgo = (iso: string | null | undefined, now = new Date()): string => {
  if (!iso) return '';
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '';
  const elapsed = now.getTime() - then.getTime();
  if (elapsed < MINUTE_MS) return 'just now';
  if (elapsed < HOUR_MS) {
    const minutes = Math.floor(elapsed / MINUTE_MS);
    return `${minutes} min ago`;
  }
  if (elapsed < DAY_MS) {
    const hours = Math.floor(elapsed / HOUR_MS);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  const days = Math.floor(elapsed / DAY_MS);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

export const daysBetween = (fromIso: string, toIso: string): number | null => {
  const from = new Date(fromIso.slice(0, 10));
  const to = new Date(toIso.slice(0, 10));
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
};

export const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
