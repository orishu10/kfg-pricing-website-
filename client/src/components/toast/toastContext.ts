import { createContext } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  action?: ToastAction;
  duration?: number;
}

export interface Toast extends ToastOptions {
  id: number;
  variant: ToastVariant;
  duration: number;
}

export interface ToastContextValue {
  showToast: (options: ToastOptions) => number;
  dismissToast: (id: number) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
