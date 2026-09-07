import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getChatMessagesByConversation,
  getStreamEvents,
  markStreamEventsRead,
  markAllStreamEventsRead,
} from './db';
import { subscribeBroadcast, broadcastEvent } from './broadcast';
import { enqueueChatMessage, processOutbox } from './OutboxWorker';
import { syncCatchUp, rebuildFromBootstrap, syncReadStatesToBackend } from './syncEngine';
import { ChatMessageRecord, StreamEventRecord, EventBusMessage } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// 1. useConversationMessages
// ─────────────────────────────────────────────────────────────────────────────

export interface UseConversationMessagesOptions {
  apiClient?: any;
  currentUserId?: string;
  currentUserName?: string;
  defaultEndpoint?: string;
  limit?: number;
}

export function useConversationMessages(
  conversationId: string,
  options?: UseConversationMessagesOptions
) {
  const [messages, setMessages] = useState<ChatMessageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const loadMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    try {
      const items = await getChatMessagesByConversation(conversationId, optionsRef.current?.limit || 200);
      setMessages(items);
    } catch (err) {
      console.warn('[useConversationMessages] Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();

    // Subscribe to multi-tab broadcast events
    const unsubscribe = subscribeBroadcast((msg: EventBusMessage) => {
      if (
        (msg.type === 'MESSAGE_STATUS_CHANGED' && msg.payload?.conversationId === conversationId) ||
        msg.type === 'EVENT_APPENDED' ||
        msg.type === 'BOOTSTRAP_RELOAD'
      ) {
        loadMessages();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [conversationId, loadMessages]);

  const sendMessage = useCallback(
    async (
      content: string,
      extra?: {
        images?: { url: string }[];
        attachments?: string[];
        metadata?: any;
        endpoint?: string;
      }
    ) => {
      if (!conversationId || !content.trim()) return null;

      const client = optionsRef.current?.apiClient;
      const senderId = optionsRef.current?.currentUserId || 'unknown';
      const senderName = optionsRef.current?.currentUserName || 'User';
      const endpoint = extra?.endpoint || optionsRef.current?.defaultEndpoint || '/comments/comments';

      const chatRecord = await enqueueChatMessage(client, {
        conversationId,
        senderId,
        senderName,
        content,
        endpoint,
        images: extra?.images,
        attachments: extra?.attachments,
        metadata: extra?.metadata,
      });

      // Optimistically insert into local state immediately
      setMessages((prev) => [...prev, chatRecord]);
      return chatRecord;
    },
    [conversationId]
  );

  const resendMessage = useCallback(
    async () => {
      const client = optionsRef.current?.apiClient;
      if (client) {
        await processOutbox(client);
        await loadMessages();
      }
    },
    [loadMessages]
  );

  return {
    messages,
    loading,
    sendMessage,
    resendMessage,
    reload: loadMessages,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. useUnreadCounter
// ─────────────────────────────────────────────────────────────────────────────

export interface UseUnreadCounterOptions {
  tenantCode?: string;
  userId?: string;
}

export function useUnreadCounter(options?: UseUnreadCounterOptions) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const tenantCode = options?.tenantCode;
  const userId = options?.userId;

  const computeCounts = useCallback(async () => {
    try {
      const unreadEvents = await getStreamEvents({
        tenant_code: tenantCode,
        user_id: userId,
        is_read: false,
        limit: 1000,
      });

      setUnreadCount(unreadEvents.length);

      const cats: Record<string, number> = {};
      for (const e of unreadEvents) {
        const cat = e.type || 'general';
        cats[cat] = (cats[cat] || 0) + 1;
      }
      setCategoryCounts(cats);
    } catch (err) {
      console.warn('[useUnreadCounter] Failed to compute counts:', err);
    }
  }, [tenantCode, userId]);

  useEffect(() => {
    computeCounts();

    const unsubscribe = subscribeBroadcast((msg: EventBusMessage) => {
      if (
        msg.type === 'READ_STATE_CHANGED' ||
        msg.type === 'READ_ALL_STATE_CHANGED' ||
        msg.type === 'EVENT_APPENDED' ||
        msg.type === 'BOOTSTRAP_RELOAD'
      ) {
        computeCounts();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [computeCounts]);

  return {
    unreadCount,
    categoryCounts,
    reload: computeCounts,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. useNotificationList
// ─────────────────────────────────────────────────────────────────────────────

export interface UseNotificationListOptions {
  apiClient?: any;
  tenantCode?: string;
  userId?: string;
  type?: string;
  limit?: number;
}

export function useNotificationList(options?: UseNotificationListOptions) {
  const [notifications, setNotifications] = useState<StreamEventRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const apiClient = options?.apiClient;
  const tenantCode = options?.tenantCode;
  const userId = options?.userId;
  const type = options?.type;
  const limit = options?.limit || 100;

  const loadNotifications = useCallback(async () => {
    try {
      const items = await getStreamEvents({
        tenant_code: tenantCode,
        user_id: userId,
        type,
        limit,
      });

      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.is_read).length);
    } catch (err) {
      console.warn('[useNotificationList] Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantCode, userId, type, limit]);

  useEffect(() => {
    loadNotifications();

    const unsubscribe = subscribeBroadcast((msg: EventBusMessage) => {
      if (
        msg.type === 'EVENT_APPENDED' ||
        msg.type === 'READ_STATE_CHANGED' ||
        msg.type === 'READ_ALL_STATE_CHANGED' ||
        msg.type === 'BOOTSTRAP_RELOAD'
      ) {
        loadNotifications();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [loadNotifications]);

  const markAsRead = useCallback(
    async (id: string) => {
      // 1. Optimistic local update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // 2. Persist to IndexedDB
      await markStreamEventsRead([id]);

      // 3. Broadcast to all open tabs
      broadcastEvent('READ_STATE_CHANGED', {
        tenant_code: tenantCode,
        user_id: userId,
        payload: { id },
      });

      // 4. Sync acknowledgment to backend if apiClient provided
      if (apiClient) {
        syncReadStatesToBackend(apiClient).catch((err) => {
          console.warn('[useNotificationList] Failed to sync read state to backend:', err);
        });
      }
    },
    [tenantCode, userId, apiClient]
  );

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    await markAllStreamEventsRead(tenantCode, userId);

    broadcastEvent('READ_ALL_STATE_CHANGED', {
      tenant_code: tenantCode,
      user_id: userId,
    });

    if (apiClient) {
      syncReadStatesToBackend(apiClient).catch((err) => {
        console.warn('[useNotificationList] Failed to sync all read state to backend:', err);
      });
    }
  }, [tenantCode, userId, apiClient]);

  /**
   * Rebuild the local notification store from fresh (e.g. after retention expiry or user manual refresh)
   */
  const rebuildDatabase = useCallback(async () => {
    if (!apiClient || !tenantCode || !userId) return;
    setLoading(true);
    try {
      await rebuildFromBootstrap(apiClient, tenantCode, userId);
      await loadNotifications();
    } finally {
      setLoading(false);
    }
  }, [apiClient, tenantCode, userId, loadNotifications]);

  const syncStream = useCallback(async () => {
    if (!apiClient || !tenantCode || !userId) return;
    try {
      await syncCatchUp(apiClient, tenantCode, userId);
      await loadNotifications();
    } catch (err) {
      console.warn('[useNotificationList] Stream sync error:', err);
    }
  }, [apiClient, tenantCode, userId, loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    rebuildDatabase,
    syncStream,
    reload: loadNotifications,
  };
}
