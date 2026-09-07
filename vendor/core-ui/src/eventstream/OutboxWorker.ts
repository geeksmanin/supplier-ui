import {
  addOutboxItem,
  getPendingOutboxItems,
  updateOutboxItem,
  removeOutboxItem,
  saveChatMessage,
  updateChatMessageStatus,
} from './db';
import { broadcastEvent } from './broadcast';
import { OutboxItem, ChatMessageRecord } from './types';

let isProcessing = false;
let onlineListenerRegistered = false;

/**
 * Register global online listener to auto-drain outbox when network recovers
 */
export function initOutboxNetworkListener(apiClient: any): void {
  if (typeof window === 'undefined' || onlineListenerRegistered) return;
  onlineListenerRegistered = true;

  window.addEventListener('online', () => {
    console.log('[OutboxWorker] Device came online, draining outbox queue...');
    processOutbox(apiClient).catch((err) => {
      console.warn('[OutboxWorker] Error during automatic online drain:', err);
    });
  });
}

/**
 * Optimistically enqueue a chat comment/message and trigger immediate delivery
 */
export async function enqueueChatMessage(
  apiClient: any,
  params: {
    conversationId: string;
    senderId: string;
    senderName?: string;
    content: string;
    endpoint?: string;
    images?: { url: string }[];
    attachments?: string[];
    metadata?: any;
  }
): Promise<ChatMessageRecord> {
  const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  const chatRecord: ChatMessageRecord = {
    id: tempId,
    conversation_id: params.conversationId,
    sender_id: params.senderId,
    sender_name: params.senderName,
    content: params.content,
    images: params.images,
    attachments: params.attachments,
    status: 'sending',
    timestamp: now,
    metadata: params.metadata,
  };

  // 1. Save optimistic chat message locally
  await saveChatMessage(chatRecord);

  // 2. Queue into outbox
  const targetEndpoint = params.endpoint || '/comments/comments';
  const outboxItem: OutboxItem = {
    id: tempId,
    conversation_id: params.conversationId,
    endpoint: targetEndpoint,
    method: 'POST',
    payload: {
      entity_id: params.conversationId,
      entity_name: params.metadata?.entity_name || 'ticket',
      comment_text: params.content,
      images: params.images?.map((i) => i.url) || [],
      attachments: params.attachments || [],
      metadata: params.metadata,
    },
    status: 'queued',
    attempts: 0,
    created_at: now,
  };

  await addOutboxItem(outboxItem);

  // 3. Broadcast instant message insertion to all tabs
  broadcastEvent('MESSAGE_STATUS_CHANGED', {
    payload: { message: chatRecord, conversationId: params.conversationId },
  });
  broadcastEvent('OUTBOX_MUTATION', {
    payload: { type: 'QUEUED', id: tempId },
  });

  // 4. Ensure network listener is ready and trigger background processing
  initOutboxNetworkListener(apiClient);
  processOutbox(apiClient).catch((err) => {
    console.warn('[OutboxWorker] Outbox processing error:', err);
  });

  return chatRecord;
}

/**
 * Process pending items in the outbox queue
 */
export async function processOutbox(apiClient: any): Promise<void> {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const items = await getPendingOutboxItems();
    if (items.length === 0) {
      isProcessing = false;
      return;
    }

    for (const item of items) {
      try {
        item.status = 'sending';
        item.last_attempt = new Date().toISOString();
        item.attempts += 1;
        await updateOutboxItem(item);

        // Perform HTTP mutation
        const response = await apiClient({
          method: item.method,
          url: item.endpoint,
          data: item.payload,
        });

        const serverData = response.data?.data || response.data;
        const serverId = serverData?.id;

        // Mutation succeeded! Transition message to 'sent'
        await updateChatMessageStatus(item.id, 'sent', serverId);
        await removeOutboxItem(item.id);

        broadcastEvent('MESSAGE_STATUS_CHANGED', {
          payload: {
            tempId: item.id,
            serverId: serverId || item.id,
            status: 'sent',
            conversationId: item.conversation_id,
          },
        });
        broadcastEvent('OUTBOX_MUTATION', {
          payload: { type: 'DELIVERED', id: item.id, serverId },
        });
      } catch (err: any) {
        console.warn(`[OutboxWorker] Failed to send item ${item.id}:`, err);
        item.status = 'failed';
        item.error = err?.message || 'Network error';
        await updateOutboxItem(item);

        await updateChatMessageStatus(item.id, 'failed');

        broadcastEvent('MESSAGE_STATUS_CHANGED', {
          payload: {
            id: item.id,
            status: 'failed',
            conversationId: item.conversation_id,
            error: item.error,
          },
        });
        broadcastEvent('OUTBOX_MUTATION', {
          payload: { type: 'FAILED', id: item.id, error: item.error },
        });
      }
    }
  } finally {
    isProcessing = false;
  }
}
