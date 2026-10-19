import { useState, useCallback, useRef } from 'react';
import { useToast } from '../components/Toast/Toast';

export interface UseDevModeTriggerOptions {
  requiredTaps?: number;
  tapWindowMs?: number;
}

export const useDevModeTrigger = (options?: UseDevModeTriggerOptions) => {
  const requiredTaps = options?.requiredTaps ?? 7;
  const tapWindowMs = options?.tapWindowMs ?? 2000;
  const [isDevModalOpen, setIsDevModalOpen] = useState<boolean>(false);
  const tapCountRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);
  const { showToast } = useToast();

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapTimeRef.current > tapWindowMs) {
      tapCountRef.current = 1;
    } else {
      tapCountRef.current += 1;
    }
    lastTapTimeRef.current = now;

    const remaining = requiredTaps - tapCountRef.current;
    if (remaining <= 3 && remaining > 0) {
      showToast(`You are ${remaining} step${remaining > 1 ? 's' : ''} away from developer options.`, 'info');
    } else if (remaining <= 0) {
      tapCountRef.current = 0;
      showToast('🛠️ Developer options unlocked!', 'success');
      setIsDevModalOpen(true);
    }
  }, [requiredTaps, tapWindowMs, showToast]);

  return {
    handleTap,
    isDevModalOpen,
    setIsDevModalOpen,
  };
};
