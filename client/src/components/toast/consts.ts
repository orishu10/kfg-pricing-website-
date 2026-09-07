import type { ToastVariant } from './toastContext';

export const TOAST_DURATION_MS = 5000;

export const MAX_VISIBLE_TOASTS = 3;

export const TOAST_STACK_SX = {
  position: 'fixed',
  left: 24,
  bottom: 24,
  zIndex: 1400,
  display: 'flex',
  flexDirection: 'column',
  gap: 1.25,
  width: 380,
  maxWidth: 'calc(100vw - 48px)',
  '@keyframes toastIn': {
    from: { opacity: 0, transform: 'translateY(12px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  '@media (prefers-reduced-motion: reduce)': {
    '& > *': { animation: 'none' },
  },
} as const;

export const TOAST_ITEM_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  px: 1.75,
  py: 1.25,
  borderRadius: 2,
  animation: 'toastIn 200ms ease-out',
} as const;

export const TOAST_ICON_STYLES: Record<ToastVariant, { bgcolor: string; color: string }> = {
  success: { bgcolor: '#e6efe1', color: '#2e7d32' },
  error: { bgcolor: '#f6e2e2', color: '#c11d28' },
  info: { bgcolor: '#dcecf4', color: '#0b5c8a' },
};
