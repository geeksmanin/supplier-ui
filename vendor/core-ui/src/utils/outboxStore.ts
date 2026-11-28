import {
  addOutboxItem,
  getPendingOutboxItems,
  updateOutboxItem,
  removeOutboxItem,
} from '../eventstream/db';
import type { OutboxItem } from '../eventstream/types';

export interface TypedOutboxEntry<TPayload extends Record<string, any> = Record<string, any>> extends OutboxItem {
  outbox_type: string;
  payload: TPayload & {
    client_msg_id: string;
    transaction_date?: string;
  };
}

/**
 * Generates a collision-resistant client_msg_id for transactional outbox submissions.
 */
export function nextOutboxClientMsgId(prefix = 'outbox'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Enqueues a typed transactional mutation into IndexedDB BEFORE any HTTP dispatch,
 * stamping client_msg_id and client capture timestamp (transaction_date) if missing.
 */
export async function enqueueTypedOutboxItem<TPayload extends Record<string, any>>(params: {
  outboxType: string;
  endpoint: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  clientMsgId?: string;
  maxAttempts?: number;
  payload: TPayload;
}): Promise<TypedOutboxEntry<TPayload>> {
  const clientMsgId = params.clientMsgId || nextOutboxClientMsgId(params.outboxType);
  const capturedAt =
    (typeof params.payload.transaction_date === 'string' && params.payload.transaction_date.trim()) ||
    new Date().toISOString();

  const entry: TypedOutboxEntry<TPayload> = {
    id: clientMsgId,
    outbox_type: params.outboxType,
    endpoint: params.endpoint,
    method: params.method || 'POST',
    payload: {
      ...params.payload,
      client_msg_id: clientMsgId,
      transaction_date: capturedAt,
    },
    status: 'queued',
    attempts: 0,
    max_attempts: params.maxAttempts ?? 5,
    created_at: capturedAt,
  };

  await addOutboxItem(entry);
  return entry;
}

export async function getPendingTypedOutboxItems<TPayload extends Record<string, any>>(
  outboxType: string,
): Promise<TypedOutboxEntry<TPayload>[]> {
  const all = await getPendingOutboxItems();
  return all.filter(
    (item): item is TypedOutboxEntry<TPayload> => item.outbox_type === outboxType,
  );
}

export async function markTypedOutboxSending<TEntry extends OutboxItem>(entry: TEntry): Promise<TEntry> {
  const updated: TEntry = {
    ...entry,
    status: 'sending',
    attempts: (entry.attempts || 0) + 1,
    last_attempt: new Date().toISOString(),
  };
  await updateOutboxItem(updated);
  return updated;
}

export async function markTypedOutboxFailed<TEntry extends OutboxItem>(
  entry: TEntry,
  error: string,
): Promise<TEntry> {
  const updated: TEntry = {
    ...entry,
    status: 'failed',
    error,
    last_attempt: new Date().toISOString(),
  };
  await updateOutboxItem(updated);
  return updated;
}

export async function removeTypedOutboxItem(id: string): Promise<void> {
  await removeOutboxItem(id);
}
