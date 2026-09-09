import { useEffect } from 'react';

let openEditors = 0;

export const hasUnsavedWork = () => openEditors > 0;

export const useUnsavedWork = (dirty: boolean) => {
  useEffect(() => {
    if (!dirty) return;
    openEditors += 1;
    return () => {
      openEditors -= 1;
    };
  }, [dirty]);
};
