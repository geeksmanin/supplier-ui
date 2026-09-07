import {
  saveStreamEvents,
  saveChatMessages,
  saveCachedConversations,
  clearStreamEvents,
  getWatermark,
  saveWatermark,
  resetWatermark,
  getUnsyncedReadStates,
  markReadStatesSynced,
} from './db';
import { broadcastEvent } from './broadcast';
import { StreamEventRecord, ChatMessageRecord } from './types';

export interface SyncEngineOptions {
  apiClient: any; // apiClient from @geeksman/core-ui
  tenantCode: string;
  userId: string;
}

/**
 * Perform sequential catch-up sync with backend BadgerDB event stream
 */
export async function syncCatchUp(
  apiClient: any,
  tenantCode: string,
  userId: string
): Promise<{ syncedCount: number; latestSeq: number; needsBootstrap: boolean }> {
  if (!tenantCode || !userId) {
    return { syncedCount: 0, latestSeq: 0, needsBootstrap: false };
  }

  const lastSeq = await getWatermark(tenantCode, userId);

  // If client has never synced before (watermark === 0), do a cold-start bootstrap hydration
  if (lastSeq === 0) {
    const bootstrapRes = await rebuildFromBootstrap(apiClient, tenantCode, userId);
    return {
      syncedCount: bootstrapRes.eventCount,
      latestSeq: bootstrapRes.latestSeq,
      needsBootstrap: true,
    };
  }

  try {
    const res = await apiClient.get('/stream/sync', {
      params: {
        since_seq: lastSeq,
        limit: 100,
      },
    });

    const data = res.data?.data;
    if (!data) {
      return { syncedCount: 0, latestSeq: lastSeq, needsBootstrap: false };
    }

    // If client's sequence was pruned due to retention period expiry (14-day TTL),
    // backend returns needs_bootstrap: true. Rebuild fresh snapshot!
    if (data.needs_bootstrap) {
      console.warn('[SyncEngine] Retention period expired or gap detected; triggering fresh bootstrap rebuild.');
      const bootstrapRes = await rebuildFromBootstrap(apiClient, tenantCode, userId);
      return {
        syncedCount: bootstrapRes.eventCount,
        latestSeq: bootstrapRes.latestSeq,
        needsBootstrap: true,
      };
    }

    const rawEvents = data.events || [];
    const latestSeq = Number(data.latest_seq) || lastSeq;

    if (rawEvents.length > 0) {
      const records: StreamEventRecord[] = rawEvents.map((e: any) => ({
        id: e.id || e.event_id || `evt_${e.seq}`,
        seq: Number(e.seq) || 0,
        tenant_code: e.tenant_code || tenantCode,
        user_id: e.user_id || userId,
        type: e.type || 'notification',
        title: e.title || (e.payload && e.payload.title) || '',
        message: e.message || (e.payload && e.payload.message) || '',
        link: e.link || (e.payload && e.payload.link) || '',
        metadata: e.metadata || (e.payload && e.payload.metadata),
        is_read: Boolean(e.is_read || (e.payload && e.payload.is_read)),
        created_at: e.created_at || (e.payload && e.payload.created_at) || new Date().toISOString(),
      }));

      await saveStreamEvents(records);

      // Extract complete chat messages and tickets from notifications so local stores process them independently
      const chatRecords: ChatMessageRecord[] = [];
      const ticketRecords: any[] = [];
      for (const r of records) {
        let meta = r.metadata;
        if (typeof meta === 'string') {
          try {
            meta = JSON.parse(meta);
          } catch (e) {}
        }
        const convId = meta?.conversation_id || (meta?.entity_name === 'ticket' ? meta?.entity_id : undefined);
        const content = meta?.content || r.message || '';
        if (convId && content) {
          chatRecords.push({
            id: meta?.id || r.id,
            conversation_id: convId,
            sender_id: meta?.created_by?.id || meta?.sender_id || 'unknown',
            sender_name: meta?.created_by?.name || meta?.sender_name || 'User',
            content: content,
            images: meta?.images,
            attachments: meta?.attachments,
            status: 'sent',
            timestamp: r.created_at,
            metadata: meta,
          });
        }
        if (meta?.ticket && meta.ticket.id) {
          ticketRecords.push(meta.ticket);
        }
      }
      if (chatRecords.length > 0) {
        await saveChatMessages(chatRecords);
      }
      if (ticketRecords.length > 0) {
        await saveCachedConversations(ticketRecords);
      }

      await saveWatermark(tenantCode, userId, latestSeq);

      // Acknowledge watermark with backend
      try {
        await apiClient.post('/stream/ack', { ack_seq: latestSeq });
      } catch (ackErr) {
        console.warn('[SyncEngine] Failed to ack sequence watermark:', ackErr);
      }

      // Broadcast new events to other tabs
      broadcastEvent('EVENT_APPENDED', {
        tenant_code: tenantCode,
        user_id: userId,
        payload: { count: records.length, latestSeq },
      });

      return { syncedCount: records.length, latestSeq, needsBootstrap: false };
    }

    return { syncedCount: 0, latestSeq, needsBootstrap: false };
  } catch (err) {
    console.error('[SyncEngine] Failed to sync stream events:', err);
    throw err;
  }
}

/**
 * Full cold-start or retention-expiry bootstrap hydration from server
 * Wipes stale event stream and builds fresh from /stream/bootstrap
 */
export async function rebuildFromBootstrap(
  apiClient: any,
  tenantCode: string,
  userId: string
): Promise<{ eventCount: number; latestSeq: number; unreadCount: number }> {
  if (!tenantCode || !userId) {
    return { eventCount: 0, latestSeq: 0, unreadCount: 0 };
  }

  try {
    const res = await apiClient.get('/stream/bootstrap', {
      params: { limit: 100 },
    });

    const data = res.data?.data;
    const rawEvents = data?.events || [];
    const latestSeq = Number(data?.latest_seq) || 0;
    const unreadCount = Number(data?.unread_count) || 0;

    // 1. Purge stale stream events and reset watermark
    await clearStreamEvents(tenantCode, userId);
    await resetWatermark(tenantCode, userId);

    // 2. Hydrate fresh snapshot records
    if (rawEvents.length > 0) {
      const records: StreamEventRecord[] = rawEvents.map((e: any) => ({
        id: e.id || e.event_id || `evt_${e.seq}`,
        seq: Number(e.seq) || 0,
        tenant_code: e.tenant_code || tenantCode,
        user_id: e.user_id || userId,
        type: e.type || 'notification',
        title: e.title || (e.payload && e.payload.title) || '',
        message: e.message || (e.payload && e.payload.message) || '',
        link: e.link || (e.payload && e.payload.link) || '',
        metadata: e.metadata || (e.payload && e.payload.metadata),
        is_read: Boolean(e.is_read || (e.payload && e.payload.is_read)),
        created_at: e.created_at || (e.payload && e.payload.created_at) || new Date().toISOString(),
      }));

      await saveStreamEvents(records);

      const chatRecords: ChatMessageRecord[] = [];
      const ticketRecords: any[] = [];
      for (const r of records) {
        let meta = r.metadata;
        if (typeof meta === 'string') {
          try {
            meta = JSON.parse(meta);
          } catch (e) {}
        }
        const convId = meta?.conversation_id || (meta?.entity_name === 'ticket' ? meta?.entity_id : undefined);
        const content = meta?.content || r.message || '';
        if (convId && content) {
          chatRecords.push({
            id: meta?.id || r.id,
            conversation_id: convId,
            sender_id: meta?.created_by?.id || meta?.sender_id || 'unknown',
            sender_name: meta?.created_by?.name || meta?.sender_name || 'User',
            content: content,
            images: meta?.images,
            attachments: meta?.attachments,
            status: 'sent',
            timestamp: r.created_at,
            metadata: meta,
          });
        }
        if (meta?.ticket && meta.ticket.id) {
          ticketRecords.push(meta.ticket);
        }
      }
      if (chatRecords.length > 0) {
        await saveChatMessages(chatRecords);
      }
      if (ticketRecords.length > 0) {
        await saveCachedConversations(ticketRecords);
      }
    }

    // 3. Update watermark
    await saveWatermark(tenantCode, userId, latestSeq, new Date().toISOString());

    // 4. Acknowledge watermark
    if (latestSeq > 0) {
      try {
        await apiClient.post('/stream/ack', { ack_seq: latestSeq });
      } catch (ackErr) {
        // non-blocking
      }
    }

    // 5. Broadcast fresh reload to all tabs
    broadcastEvent('BOOTSTRAP_RELOAD', {
      tenant_code: tenantCode,
      user_id: userId,
      payload: { eventCount: rawEvents.length, latestSeq, unreadCount },
    });

    return { eventCount: rawEvents.length, latestSeq, unreadCount };
  } catch (err) {
    console.error('[SyncEngine] Failed to hydrate bootstrap snapshot:', err);
    throw err;
  }
}

/**
 * Flush any locally acknowledged read states to backend
 */
export async function syncReadStatesToBackend(apiClient: any): Promise<void> {
  try {
    const unsynced = await getUnsyncedReadStates();
    if (unsynced.length === 0) return;

    const readIds = unsynced.map((u) => u.id);
    await apiClient.post('/stream/ack', { read_ids: readIds });
    await markReadStatesSynced(readIds);
  } catch (err) {
    console.warn('[SyncEngine] Failed to sync read states to backend:', err);
  }
}
