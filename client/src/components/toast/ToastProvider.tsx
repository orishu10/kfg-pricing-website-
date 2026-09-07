import { useCallback, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { MAX_VISIBLE_TOASTS, TOAST_DURATION_MS, TOAST_ICON_STYLES, TOAST_ITEM_SX, TOAST_STACK_SX } from './consts';
import { ToastContext, type Toast, type ToastOptions, type ToastVariant } from './toastContext';

const VARIANT_ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckIcon fontSize="small" />,
  error: <CloseIcon fontSize="small" />,
  info: <InfoOutlinedIcon fontSize="small" />,
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<number, number>());
  const nextId = useRef(1);

  const dismissToast = useCallback((id: number) => {
    window.clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const startTimer = useCallback(
    (toast: Toast) => {
      window.clearTimeout(timers.current.get(toast.id));
      timers.current.set(toast.id, window.setTimeout(() => dismissToast(toast.id), toast.duration));
    },
    [dismissToast],
  );

  const pauseTimer = (id: number) => {
    window.clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  };

  const showToast = useCallback(
    (options: ToastOptions) => {
      const toast: Toast = {
        ...options,
        id: nextId.current++,
        variant: options.variant ?? 'success',
        duration: options.duration ?? TOAST_DURATION_MS,
      };
      setToasts((current) => [...current, toast].slice(-MAX_VISIBLE_TOASTS));
      startTimer(toast);
      return toast.id;
    },
    [startTimer],
  );

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Box sx={TOAST_STACK_SX}>
        {toasts.map((toast) => (
          <Paper
            key={toast.id}
            elevation={6}
            role="status"
            onMouseEnter={() => pauseTimer(toast.id)}
            onMouseLeave={() => startTimer(toast)}
            sx={TOAST_ITEM_SX}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                ...TOAST_ICON_STYLES[toast.variant],
              }}
            >
              {VARIANT_ICONS[toast.variant]}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.3 }}>{toast.title}</Typography>
              {toast.description && (
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.3 }}>
                  {toast.description}
                </Typography>
              )}
            </Box>
            {toast.action && (
              <Button
                size="small"
                onClick={() => {
                  toast.action?.onClick();
                  dismissToast(toast.id);
                }}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {toast.action.label}
              </Button>
            )}
            <IconButton size="small" aria-label="Dismiss" onClick={() => dismissToast(toast.id)}>
              <CloseIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Paper>
        ))}
      </Box>
    </ToastContext.Provider>
  );
};
