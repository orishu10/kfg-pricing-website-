import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRoutes } from '../../api';
import { expiryAlerts } from '../../pages/logistics/routes/utils/helpers';
import { readDismissedAlerts, routeAlertKey, storeDismissedAlerts } from '../helpers';

export const useExpiryNotifications = (enabled: boolean) => {
  const [dismissedKeys, setDismissedKeys] = useState<string[]>(readDismissedAlerts);

  const { data: routes = [] } = useQuery({
    queryKey: ['routes'],
    queryFn: getRoutes,
    enabled,
  });

  const alerts = useMemo(
    () => expiryAlerts(routes).filter(({ route }) => !dismissedKeys.includes(routeAlertKey(route))),
    [routes, dismissedKeys],
  );

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

  return { alerts, dismissAlert, dismissAllAlerts };
};
