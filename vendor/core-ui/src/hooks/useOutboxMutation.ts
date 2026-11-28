import { useCallback, useEffect, useRef, useState } from 'react';
import {
  enqueueTypedOutboxItem,
  getPendingTypedOutboxItems,
  markTypedOutboxFailed,
  markTypedOutboxSending,
  nextOutboxClientMsgId,
  removeTypedOutboxItem,
  TypedOutboxEntry,
} from '../utils/outboxStore';

export interface UseOutboxMutationOptions<TPayload extends Record<string, any>, TResult = any> {
  outboxType: string;
  endpoint: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  maxAttempts?: number;
  dispatch: (payload: TPayload & { client_msg_id: string; transaction_date: string }) => Promise<TResult>;
  onSuccess?: (result: TResult, clientMsgId: string) => void;
  onError?: (error: string, clientMsgId: string) => void;
  autoDrainOnline?: boolean;
}

export interface UseOutboxMutationResult<TPayload extends Record<string, any>, TResult = any> {
  mutate: (payload: TPayload, existingClientMsgId?: string) => Promise<{ success: boolean; data?: TResult; error?: string; clientMsgId: string }>;
  drainPending: () => Promise<void>;
  isSubmitting: boolean;
  pendingCount: number;
  lastError: string | null;
}

/**
 * Shared React hook for transactional mutations that require:
 * 1) Persistent IndexedDB durability before network dispatch
 * 2) Stable client_msg_id idempotency across retries
 * 3) Capture-time transaction_date preservation on offline / delayed drain
 */
export function useOutboxMutation<TPayload extends Record<string, any>, TResult = any>(
  options: UseOutboxMutationOptions<TPayload, TResult>,
): UseOutboxMutationResult<TPayload, TResult> {
  const {
    outboxType,
    endpoint,
    method = 'POST',
    maxAttempts = 5,
    dispatch,
    onSuccess,
    onError,
    autoDrainOnline = true,
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const drainingRef = useRef(false);
  const mountedRef = useRef(true);

  const refreshPendingCount = useCallback(async () => {
    try {
      const items = await getPendingTypedOutboxItems<TPayload>(outboxType);
      if (mountedRef.current) {
        setPendingCount(items.length);
      }
    } catch {
      // IndexedDB unavailable in restricted mode
    }
  }, [outboxType]);

  const executeEntry = useCallback(
    async (entry: TypedOutboxEntry<TPayload>): Promise<{ success: boolean; data?: TResult; error?: string }> => {
      const txDate = entry.payload.transaction_date || entry.created_at || new Date().toISOString();
      try {
        await markTypedOutboxSending(entry);
        const result = await dispatch({
          ...entry.payload,
          client_msg_id: entry.id,
          transaction_date: txDate,
        });
        await removeTypedOutboxItem(entry.id);
        await refreshPendingCount();
        onSuccess?.(result, entry.id);
        return { success: true, data: result };
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Request failed';
        await markTypedOutboxFailed(entry, msg);
        await refreshPendingCount();
        if (mountedRef.current) {
          setLastError(msg);
        }
        onError?.(msg, entry.id);
        return { success: false, error: msg };
      }
    },
    [dispatch, onError, onSuccess, refreshPendingCount],
  );

  const mutate = useCallback(
    async (payload: TPayload, existingClientMsgId?: string) => {
      const clientMsgId =
        existingClientMsgId ||
        (typeof payload.client_msg_id === 'string' && payload.client_msg_id) ||
        nextOutboxClientMsgId(outboxType);

      setIsSubmitting(true);
      setLastError(null);
      try {
        const entry = await enqueueTypedOutboxItem({
          outboxType,
          endpoint,
          method,
          maxAttempts,
          clientMsgId,
          payload,
        });
        await refreshPendingCount();
        const res = await executeEntry(entry);
        return { ...res, clientMsgId };
      } finally {
        if (mountedRef.current) {
          setIsSubmitting(false);
        }
      }
    },
    [endpoint, executeEntry, maxAttempts, method, outboxType, refreshPendingCount],
  );

  const drainPending = useCallback(async () => {
    if (drainingRef.current) return;
    drainingRef.current = true;
    try {
      const pending = await getPendingTypedOutboxItems<TPayload>(outboxType);
      for (const entry of pending) {
        if (!mountedRef.current) break;
        if ((entry.attempts || 0) >= (entry.max_attempts ?? maxAttempts)) {
          continue;
        }
        await executeEntry(entry);
      }
    } finally {
      drainingRef.current = false;
    }
  }, [executeEntry, maxAttempts, outboxType]);

  useEffect(() => {
    mountedRef.current = true;
    refreshPendingCount();
    if (!autoDrainOnline || typeof window === 'undefined') {
      return () => {
        mountedRef.current = false;
      };
    }
    const handleOnline = () => {
      drainPending().catch(() => {});
    };
    window.addEventListener('online', handleOnline);
    return () => {
      mountedRef.current = false;
      window.removeEventListener('online', handleOnline);
    };
  }, [autoDrainOnline, drainPending, refreshPendingCount]);

  return {
    mutate,
    drainPending,
    isSubmitting,
    pendingCount,
    lastError,
  };
}
