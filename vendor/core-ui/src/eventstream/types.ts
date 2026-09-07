/**
 * Types for Geeksman ERP Local-First Event Stream & Offline Outbox
 */

export interface StreamEventRecord {
  id: string;
  seq: number;
  tenant_code: string;
  user_id: string;
  type: string;
  title?: string;
  message?: string;
  link?: string;
  metadata?: any;
  is_read: boolean;
  created_at: string;
}

export type MessageDeliveryStatus = 'pending' | 'sending' | 'sent' | 'failed';

export interface ChatMessageRecord {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name?: string;
  content: string;
  images?: { url: string }[];
  attachments?: string[];
  status: MessageDeliveryStatus;
  timestamp: string;
  metadata?: any;
}

export type OutboxStatus = 'queued' | 'sending' | 'failed';

export interface OutboxItem {
  id: string;
  conversation_id?: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH';
  payload: any;
  status: OutboxStatus;
  attempts: number;
  last_attempt?: string;
  error?: string;
  created_at: string;
}

export interface ReadStateRecord {
  id: string;
  is_read: boolean;
  read_at: string;
  synced: boolean;
}

export interface MetaRecord {
  key: string;
  last_seq: number;
  bootstrapped_at?: string;
  retention_days?: number;
  updated_at: string;
}

export type EventBusActionType =
  | 'EVENT_APPENDED'
  | 'READ_STATE_CHANGED'
  | 'READ_ALL_STATE_CHANGED'
  | 'OUTBOX_MUTATION'
  | 'MESSAGE_STATUS_CHANGED'
  | 'CONVERSATION_MUTATION'
  | 'BOOTSTRAP_RELOAD';

export interface EventBusMessage {
  type: EventBusActionType;
  tenant_code?: string;
  user_id?: string;
  payload?: any;
  timestamp: number;
}
