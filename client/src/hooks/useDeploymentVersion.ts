import { useEffect, useRef, useState } from 'react';
import api, { getAppVersion } from '../api';

const VERSION_HEADER = 'x-app-version';
const FALLBACK_POLL_MS = 15 * 60_000;

export const useDeploymentVersion = () => {
  const [updateReady, setUpdateReady] = useState(false);
  const loadedVersion = useRef<string | null>(null);
  const disabled = useRef(false);

  useEffect(() => {
    let active = true;

    const compare = (version?: string) => {
      if (!active || !version || disabled.current) return;
      if (loadedVersion.current === null) {
        loadedVersion.current = version;
        return;
      }
      if (version !== loadedVersion.current) setUpdateReady(true);
    };

    const checkNow = async () => {
      const data = await getAppVersion().catch(() => null);
      if (!active || !data) return;
      if (!data.autoRefresh) {
        disabled.current = true;
        return;
      }
      compare(data.version);
    };

    const interceptor = api.interceptors.response.use(
      (response) => {
        compare(response.headers?.[VERSION_HEADER]);
        return response;
      },
      (error) => {
        compare(error?.response?.headers?.[VERSION_HEADER]);
        return Promise.reject(error);
      },
    );

    checkNow();
    const timer = window.setInterval(checkNow, FALLBACK_POLL_MS);
    document.addEventListener('visibilitychange', checkNow);

    return () => {
      active = false;
      api.interceptors.response.eject(interceptor);
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', checkNow);
    };
  }, []);

  return updateReady;
};
