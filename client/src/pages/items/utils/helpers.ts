export const toNum = (v: string): number | null => (v.trim() === '' ? null : parseFloat(v));
export const toInt = (v: string): number | null => (v.trim() === '' ? null : parseInt(v, 10));
export const fmt = (v: string | number | null | undefined): string =>
  v == null ? '' : String(v);