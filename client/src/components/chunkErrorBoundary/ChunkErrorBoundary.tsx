import { Component, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { CHUNK_ERROR_PATTERN, RELOAD_COOLDOWN_MS, RELOAD_MARKER } from './consts';

const isChunkLoadError = (error: unknown) =>
  CHUNK_ERROR_PATTERN.test(error instanceof Error ? error.message : String(error));

const reloadedRecently = () => {
  try {
    return Date.now() - Number(sessionStorage.getItem(RELOAD_MARKER) ?? 0) < RELOAD_COOLDOWN_MS;
  } catch {
    return false;
  }
};

const markReload = () => {
  try {
    sessionStorage.setItem(RELOAD_MARKER, String(Date.now()));
  } catch {
    return;
  }
};

export class ChunkErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (!isChunkLoadError(error) || reloadedRecently()) return;
    markReload();
    window.location.reload();
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minHeight: '50vh', justifyContent: 'center' }}>
        <Typography variant="h6" fontWeight={700}>This page could not be loaded</Typography>
        <Typography variant="body2" color="text.secondary">
          A new version may have been deployed. Refreshing usually fixes it.
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>Refresh</Button>
      </Box>
    );
  }
}
