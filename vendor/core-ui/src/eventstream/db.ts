import {
  StreamEventRecord,
  ChatMessageRecord,
  OutboxItem,
  ReadStateRecord,
  MetaRecord,
  MessageDeliveryStatus,
} from './types';

export const DB_NAME = 'GeeksmanErpLocalStore';
export const DB_VERSION = 2;

export const STORES = {
  STREAM_EVENTS: 'stream_events',
  CONVERSATIONS: 'conversations',
  CHAT_MESSAGES: 'chat_messages',
  CHAT_DRAFTS: 'chat_drafts',
  OUTBOX: 'outbox',
  READ_STATES: 'read_states',
  META: 'meta',
} as const;

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

export function openEventStreamDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB not supported in this environment'));
  }

  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;

      // 1. stream_events
      if (!db.objectStoreNames.contains(STORES.STREAM_EVENTS)) {
        const streamStore = db.createObjectStore(STORES.STREAM_EVENTS, { keyPath: 'id' });
        streamStore.createIndex('seq', 'seq', { unique: false });
        streamStore.createIndex('tenant_user', ['tenant_code', 'user_id'], { unique: false });
        streamStore.createIndex('type', 'type', { unique: false });
        streamStore.createIndex('created_at', 'created_at', { unique: false });
      }

      // 2. conversations (unified ticket/order/chat thread store)
      if (!db.objectStoreNames.contains(STORES.CONVERSATIONS)) {
        const convStore = db.createObjectStore(STORES.CONVERSATIONS, { keyPath: 'id' });
        convStore.createIndex('status', 'status', { unique: false });
        convStore.createIndex('ticket_type', 'ticket_type', { unique: false });
        convStore.createIndex('created_at', 'created_at', { unique: false });
        convStore.createIndex('owner_id', 'owner_id', { unique: false });
        convStore.createIndex('reference_id', 'reference_id', { unique: false });
      }

      // 3. chat_messages
      if (!db.objectStoreNames.contains(STORES.CHAT_MESSAGES)) {
        const chatStore = db.createObjectStore(STORES.CHAT_MESSAGES, { keyPath: 'id' });
        chatStore.createIndex('conversation_id', 'conversation_id', { unique: false });
        chatStore.createIndex('status', 'status', { unique: false });
        chatStore.createIndex('timestamp', 'timestamp', { unique: false });
        chatStore.createIndex('created_at', 'created_at', { unique: false });
      } else {
        const chatStore = (req.transaction as any)?.objectStore(STORES.CHAT_MESSAGES);
        if (chatStore && !chatStore.indexNames.contains('created_at')) {
          chatStore.createIndex('created_at', 'created_at', { unique: false });
        }
      }

      // 3b. messages (alias for legacy comments/tickets message store)
      if (!db.objectStoreNames.contains('messages')) {
        const legacyMsgStore = db.createObjectStore('messages', { keyPath: 'id' });
        legacyMsgStore.createIndex('conversation_id', 'conversation_id', { unique: false });
        legacyMsgStore.createIndex('channelId', 'channelId', { unique: false });
        legacyMsgStore.createIndex('created_at', 'created_at', { unique: false });
      } else {
        const legacyMsgStore = (req.transaction as any)?.objectStore('messages');
        if (legacyMsgStore && !legacyMsgStore.indexNames.contains('channelId')) {
          legacyMsgStore.createIndex('channelId', 'channelId', { unique: false });
        }
      }

      // 3c. channels (for ChatHub direct / group chat channels)
      if (!db.objectStoreNames.contains('channels')) {
        db.createObjectStore('channels', { keyPath: 'id' });
      }

      // 4. chat_drafts
      if (!db.objectStoreNames.contains(STORES.CHAT_DRAFTS)) {
        db.createObjectStore(STORES.CHAT_DRAFTS, { keyPath: 'conversationId' });
      }

      // 5. outbox
      if (!db.objectStoreNames.contains(STORES.OUTBOX)) {
        const outboxStore = db.createObjectStore(STORES.OUTBOX, { keyPath: 'id' });
        outboxStore.createIndex('status', 'status', { unique: false });
        outboxStore.createIndex('created_at', 'created_at', { unique: false });
      }

      // 6. read_states
      if (!db.objectStoreNames.contains(STORES.READ_STATES)) {
        const readStore = db.createObjectStore(STORES.READ_STATES, { keyPath: 'id' });
        readStore.createIndex('is_read', 'is_read', { unique: false });
        readStore.createIndex('synced', 'synced', { unique: false });
      }

      // 7. meta
      if (!db.objectStoreNames.contains(STORES.META)) {
        db.createObjectStore(STORES.META, { keyPath: 'key' });
      }
    };

    req.onsuccess = () => {
      dbInstance = req.result;
      dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
        dbPromise = null;
      };
      resolve(dbInstance);
    };

    req.onerror = () => {
      dbPromise = null;
      reject(req.error);
    };
  });

  return dbPromise;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stream Events Operations
// ─────────────────────────────────────────────────────────────────────────────

export async function saveStreamEvents(events: StreamEventRecord[]): Promise<void> {
  if (!events || events.length === 0) return;
  const db = await openEventStreamDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.STREAM_EVENTS, 'readwrite');
    const store = tx.objectStore(STORES.STREAM_EVENTS);

    for (const evt of events) {
      store.put(evt);
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getStreamEvents(options: {
  tenant_code?: string;
  user_id?: string;
  limit?: number;
  offset?: number;
  type?: string;
  is_read?: boolean;
}): Promise<StreamEventRecord[]> {
  const db = await openEventStreamDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.STREAM_EVENTS, 'readonly');
    const store = tx.objectStore(STORES.STREAM_EVENTS);
    const req = store.openCursor(null, 'prev'); // newest first
    const results: StreamEventRecord[] = [];
    const limit = options.limit || 100;
    const offset = options.offset || 0;
    let skipped = 0;

    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) {
        resolve(results);
        return;
      }

      const item = cursor.value as StreamEventRecord;
      let matches = true;

      if (options.tenant_code && item.tenant_code !== options.tenant_code) {
        matches = false;
      }
      if (options.user_id && item.user_id !== options.user_id) {
        matches = false;
      }
      if (options.type && item.type !== options.type) {
        matches = false;
      }
      if (options.is_read !== undefined && item.is_read !== options.is_read) {
        matches = false;
      }

      if (matches) {
        if (skipped < offset) {
          skipped++;
        } else {
          results.push(item);
          if (results.length >= limit) {
            resolve(results);
            return;
          }
        }
      }

      cursor.continue();
    };

    req.onerror = () => reject(req.error);
  });
}

export async function markStreamEventsRead(ids: string[]): Promise<void> {
  if (!ids || ids.length === 0) return;
  const db = await openEventStreamDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.STREAM_EVENTS, STORES.READ_STATES], 'readwrite');
    const streamStore = tx.objectStore(STORES.STREAM_EVENTS);
    const readStore = tx.objectStore(STORES.READ_STATES);
    const now = new Date().toISOString();

    for (const id of ids) {
      const getReq = streamStore.get(id);
      getReq.onsuccess = () => {
        if (getReq.result) {
          const item = getReq.result as StreamEventRecord;
          item.is_read = true;
          streamStore.put(item);
        }
      };

      const readRec: ReadStateRecord = {
        id,
        is_read: true,
        read_at: now,
        synced: false,
      };
      readStore.put(readRec);
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function markAllStreamEventsRead(tenant_code?: string, user_id?: string): Promise<void> {
  const db = await openEventStreamDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.STREAM_EVENTS, STORES.READ_STATES], 'readwrite');
    const streamStore = tx.objectStore(STORES.STREAM_EVENTS);
    const readStore = tx.objectStore(STORES.READ_STATES);
    const req = streamStore.openCursor();
    const now = new Date().toISOString();

    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) return;

      const item = cursor.value as StreamEventRecord;
      let matches = true;
      if (tenant_code && item.tenant_code !== tenant_code) matches = false;
      if (user_id && item.user_id !== user_id) matches = false;

      if (matches && !item.is_read) {
        item.is_read = true;
        cursor.update(item);

        const readRec: ReadStateRecord = {
          id: item.id,
          is_read: true,
          read_at: now,
          synced: false,
        };
        readStore.put(readRec);
      }

      cursor.continue();
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Cleanly wipe stream events for a fresh rebuild
 */
export async function clearStreamEvents(tenant_code?: string, user_id?: string): Promise<void> {
  const db = await openEventStreamDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.STREAM_EVENTS, 'readwrite');
    const store = tx.objectStore(STORES.STREAM_EVENTS);

    if (!tenant_code && !user_id) {
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
      return;
    }

    const req = store.openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) return;

      const item = cursor.value as StreamEventRecord;
      let matches = true;
      if (tenant_code && item.tenant_code !== tenant_code) matches = false;
      if (user_id && item.user_id !== user_id) matches = false;

      if (matches) {
        cursor.delete();
      }
      cursor.continue();
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat Messages Operations
// ─────────────────────────────────────────────────────────────────────────────

export async function saveChatMessage(msg: ChatMessageRecord): Promise<void> {
  const db = await openEventStreamDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CHAT_MESSAGES, 'readwrite');
    const store = tx.objectStore(STORES.CHAT_MESSAGES);
    store.put(msg);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveChatMessages(msgs: ChatMessageRecord[]): Promise<void> {
  if (!msgs || msgs.length === 0) return;
  const db = await openEventStreamDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CHAT_MESSAGES, 'readwrite');
    const store = tx.objectStore(STORES.CHAT_MESSAGES);
    for (const m of msgs) {
      store.put(m);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getChatMessagesByConversation(
  conversation_id: string,
  limit: number = 200
): Promise<ChatMessageRecord[]> {
  const db = await openEventStreamDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CHAT_MESSAGES, 'readonly');
    const store = tx.objectStore(STORES.CHAT_MESSAGES);
    const index = store.index('conversation_id');
    const req = index.openCursor(IDBKeyRange.only(conversation_id), 'prev');
    const results: ChatMessageRecord[] = [];

    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) {
        resolve(results.reverse()); // chronological order
        return;
      }
      results.push(cursor.value as ChatMessageRecord);
      if (results.length >= limit) {
        resolve(results.reverse());
        return;
      }
      cursor.continue();
    };

    req.onerror = () => reject(req.error);
  });
}

export async function updateChatMessageStatus(
  id: string,
  status: MessageDeliveryStatus,
  newId?: string
): Promise<void> {
  const db = await openEventStreamDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CHAT_MESSAGES, 'readwrite');
    const store = tx.objectStore(STORES.CHAT_MESSAGES);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      if (getReq.result) {
        const item = getReq.result as ChatMessageRecord;
        item.status = status;
        if (newId && newId !== id) {
          store.delete(id);
          item.id = newId;
          store.put(item);
        } else {
          store.put(item);
        }
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Conversations / Tickets Operations
// ─────────────────────────────────────────────────────────────────────────────

export async function saveCachedConversations(conversations: any[]): Promise<void> {
  if (!conversations || conversations.length === 0) return;
  const db = await openEventStreamDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CONVERSATIONS, 'readwrite');
    const store = tx.objectStore(STORES.CONVERSATIONS);
    for (const c of conversations) {
      if (c && c.id) {
        store.put(c);
      }
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function upsertCachedConversation(conversation: any): Promise<void> {
  if (!conversation || !conversation.id) return;
  const db = await openEventStreamDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CONVERSATIONS, 'readwrite');
    const store = tx.objectStore(STORES.CONVERSATIONS);
    store.put(conversation);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedConversations(): Promise<any[]> {
  const db = await openEventStreamDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CONVERSATIONS, 'readonly');
    const store = tx.objectStore(STORES.CONVERSATIONS);
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result as any[]) || []);
    req.onerror = () => reject(req.error);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Outbox Operations
// ─────────────────────────────────────────────────────────────────────────────

export async function addOutboxItem(item: OutboxItem): Promise<void> {
  const db = await openEventStreamDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.OUTBOX, 'readwrite');
    const store = tx.objectStore(STORES.OUTBOX);
    store.put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingOutboxItems(): Promise<OutboxItem[]> {
  const db = await openEventStreamDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.OUTBOX, 'readonly');
    const store = tx.objectStore(STORES.OUTBOX);
    const req = store.openCursor();
    const results: OutboxItem[] = [];

    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) {
        resolve(results);
        return;
      }
      const item = cursor.value as OutboxItem;
      if (item.status === 'queued' || item.status === 'failed') {
        results.push(item);
      }
      cursor.continue();
    };

    req.onerror = () => reject(req.error);
  });
}

export async function updateOutboxItem(item: OutboxItem): Promise<void> {
  const db = await openEventStreamDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.OUTBOX, 'readwrite');
    const store = tx.objectStore(STORES.OUTBOX);
    store.put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function removeOutboxItem(id: string): Promise<void> {
  const db = await openEventStreamDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.OUTBOX, 'readwrite');
    const store = tx.objectStore(STORES.OUTBOX);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Read States Operations
// ─────────────────────────────────────────────────────────────────────────────

export async function getUnsyncedReadStates(): Promise<ReadStateRecord[]> {
  const db = await openEventStreamDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.READ_STATES, 'readonly');
    const store = tx.objectStore(STORES.READ_STATES);
    const req = store.openCursor();
    const results: ReadStateRecord[] = [];

    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) {
        resolve(results);
        return;
      }
      const item = cursor.value as ReadStateRecord;
      if (!item.synced) {
        results.push(item);
      }
      cursor.continue();
    };

    req.onerror = () => reject(req.error);
  });
}

export async function markReadStatesSynced(ids: string[]): Promise<void> {
  if (!ids || ids.length === 0) return;
  const db = await openEventStreamDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.READ_STATES, 'readwrite');
    const store = tx.objectStore(STORES.READ_STATES);

    for (const id of ids) {
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        if (getReq.result) {
          const item = getReq.result as ReadStateRecord;
          item.synced = true;
          store.put(item);
        }
      };
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Watermark / Meta Operations
// ─────────────────────────────────────────────────────────────────────────────

export async function getWatermark(tenant_code: string, user_id: string): Promise<number> {
  const db = await openEventStreamDB();
  const key = `watermark_${tenant_code || 'default'}_${user_id || 'default'}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.META, 'readonly');
    const store = tx.objectStore(STORES.META);
    const req = store.get(key);

    req.onsuccess = () => {
      if (req.result) {
        const meta = req.result as MetaRecord;
        resolve(meta.last_seq || 0);
      } else {
        resolve(0);
      }
    };

    req.onerror = () => reject(req.error);
  });
}

export async function saveWatermark(
  tenant_code: string,
  user_id: string,
  last_seq: number,
  bootstrapped_at?: string
): Promise<void> {
  const db = await openEventStreamDB();
  const key = `watermark_${tenant_code || 'default'}_${user_id || 'default'}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.META, 'readwrite');
    const store = tx.objectStore(STORES.META);
    const getReq = store.get(key);

    getReq.onsuccess = () => {
      const existing = (getReq.result as MetaRecord) || { key, last_seq: 0, updated_at: '' };
      existing.last_seq = last_seq;
      existing.updated_at = new Date().toISOString();
      if (bootstrapped_at) {
        existing.bootstrapped_at = bootstrapped_at;
      }
      store.put(existing);
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function resetWatermark(tenant_code: string, user_id: string): Promise<void> {
  const db = await openEventStreamDB();
  const key = `watermark_${tenant_code || 'default'}_${user_id || 'default'}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.META, 'readwrite');
    const store = tx.objectStore(STORES.META);
    store.delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
