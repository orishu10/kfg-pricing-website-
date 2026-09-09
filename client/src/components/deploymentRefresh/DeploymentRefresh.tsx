import { useEffect } from 'react';
import { useDeploymentVersion } from '../../hooks/useDeploymentVersion';
import { hasUnsavedWork } from '../../hooks/useUnsavedWork';
import { useToast } from '../toast/useToast';
import { UPDATE_TOAST_DURATION_MS } from './consts';

export const DeploymentRefresh = () => {
  const updateReady = useDeploymentVersion();
  const { showToast } = useToast();

  useEffect(() => {
    if (!updateReady) return;

    const reloadWhenIdle = () => {
      if (document.visibilityState === 'hidden' && !hasUnsavedWork()) window.location.reload();
    };

    reloadWhenIdle();
    document.addEventListener('visibilitychange', reloadWhenIdle);
    return () => document.removeEventListener('visibilitychange', reloadWhenIdle);
  }, [updateReady]);

  useEffect(() => {
    if (!updateReady) return;
    showToast({
      title: 'A new version is available',
      description: 'Refresh to load the latest changes.',
      variant: 'info',
      duration: UPDATE_TOAST_DURATION_MS,
      action: { label: 'Refresh', onClick: () => window.location.reload() },
    });
  }, [updateReady, showToast]);

  return null;
};
