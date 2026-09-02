import type { Route } from '../api';
import { DISMISSED_ALERTS_STORAGE_KEY } from './consts';

export const routeAlertKey = (route: Route) => `${route.id}:${route.validity?.slice(0, 10) ?? ''}`;

export const readDismissedAlerts = (): string[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(DISMISSED_ALERTS_STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((key): key is string => typeof key === 'string') : [];
  } catch {
    return [];
  }
};

export const storeDismissedAlerts = (keys: string[]) => {
  localStorage.setItem(DISMISSED_ALERTS_STORAGE_KEY, JSON.stringify(keys));
};
