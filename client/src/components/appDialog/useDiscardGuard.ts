import { useState } from 'react';

export const useDiscardGuard = (dirty: boolean) => {
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const guard = (action: () => void) => {
    if (dirty) setPendingAction(() => action);
    else action();
  };

  const discard = () => {
    pendingAction?.();
    setPendingAction(null);
  };

  const keepEditing = () => setPendingAction(null);

  return { guardOpen: pendingAction !== null, guard, discard, keepEditing };
};
