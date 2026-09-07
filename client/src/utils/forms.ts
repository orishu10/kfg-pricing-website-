export const changedFieldCount = <T extends object>(current: T, initial: T): number =>
  (Object.keys(current) as (keyof T)[]).filter(
    (key) => JSON.stringify(current[key]) !== JSON.stringify(initial[key]),
  ).length;

export const initials = (name: string, fallback = '?'): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  const letters = parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0];
  return letters.toUpperCase();
};

export const PHONE_PATTERN = /^[+\d\s()-]*$/;
