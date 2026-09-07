import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRouteExpiryStatus, getRoutes } from '../../api';
import { expiryAlerts, worstSeverity } from '../../pages/logistics/routes/utils/helpers';
import { BELL_PULSE_MS } from '../consts';
import {
  readDismissedAlerts, readSeenAlerts, routeAlertKey, storeDismissedAlerts, storeSeenAlerts,
} from '../helpers';

export const useExpiryNotifications = (enabled: boolean) => {
  const [dismissedKeys, setDismissedKeys] = useState<string[]>(readDismissedAlerts);
  const [pulse, setPulse] = useState(false);

  const { data: routes = [] } = useQuery({
    queryKey: ['routes'],
    queryFn: getRoutes,
    enabled,
  });

  const { data: expiryStatus } = useQuery({
    queryKey: ['route-expiry-status'],
    queryFn: getRouteExpiryStatus,
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const alerts = useMemo(
    () => expiryAlerts(routes).filter(({ route }) => !dismissedKeys.includes(routeAlertKey(route))),
    [routes, dismissedKeys],
  );

  const severity = useMemo(() => worstSeverity(alerts), [alerts]);

  const alertKeys = useMemo(() => alerts.map(({ route }) => routeAlertKey(route)).join('|'), [alerts]);
  const [checkedAlertKeys, setCheckedAlertKeys] = useState('');
  if (alertKeys !== checkedAlertKeys) {
    setCheckedAlertKeys(alertKeys);
    const seen = readSeenAlerts();
    const fresh = alertKeys ? alertKeys.split('|').filter((key) => !seen.includes(key)) : [];
    if (fresh.length > 0) {
      storeSeenAlerts([...seen, ...fresh]);
      setPulse(true);
    }
  }

  useEffect(() => {
    if (!pulse) return;
    const timer = window.setTimeout(() => setPulse(false), BELL_PULSE_MS);
    return () => window.clearTimeout(timer);
  }, [pulse]);

  const persist = useCallback((keys: string[]) => {
    setDismissedKeys(keys);
    storeDismissedAlerts(keys);
  }, []);

  const dismissAlert = useCallback(
    (key: string) => persist([...dismissedKeys, key]),
    [dismissedKeys, persist],
  );

  const dismissAllAlerts = useCallback(
    () => persist([...dismissedKeys, ...alerts.map(({ route }) => routeAlertKey(route))]),
    [alerts, dismissedKeys, persist],
  );

  return {
    alerts,
    severity,
    pulse,
    lastSentAt: expiryStatus?.lastSentAt ?? null,
    sentStages: expiryStatus?.sentStages ?? {},
    dismissAlert,
    dismissAllAlerts,
  };
};
