import { EventBusMessage, EventBusActionType } from './types';

const CHANNEL_NAME = 'geeksman_event_bus';
const FALLBACK_STORAGE_KEY = 'geeksman_event_bus_msg';

let channel: BroadcastChannel | null = null;
const subscribers = new Set<(msg: EventBusMessage) => void>();

if (typeof window !== 'undefined') {
  if ('BroadcastChannel' in window) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event: MessageEvent) => {
        if (event.data && typeof event.data === 'object' && event.data.type) {
          notifySubscribers(event.data as EventBusMessage);
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel failed to initialize, using fallback:', e);
      channel = null;
    }
  }

  // Fallback for older environments or cross-origin iframes
  window.addEventListener('storage', (event) => {
    if (event.key === FALLBACK_STORAGE_KEY && event.newValue) {
      try {
        const msg = JSON.parse(event.newValue) as EventBusMessage;
        notifySubscribers(msg);
      } catch (e) {
        // ignore parse error
      }
    }
  });
}

function notifySubscribers(msg: EventBusMessage) {
  subscribers.forEach((cb) => {
    try {
      cb(msg);
    } catch (err) {
      console.error('Error in event bus subscriber callback:', err);
    }
  });
}

/**
 * Broadcast an event to all open browser tabs
 */
export function broadcastEvent(
  type: EventBusActionType,
  options?: { tenant_code?: string; user_id?: string; payload?: any }
): void {
  const msg: EventBusMessage = {
    type,
    tenant_code: options?.tenant_code,
    user_id: options?.user_id,
    payload: options?.payload,
    timestamp: Date.now(),
  };

  // 1. Notify local subscribers in the current tab
  notifySubscribers(msg);

  // 2. Broadcast to other tabs
  if (channel) {
    try {
      channel.postMessage(msg);
    } catch (err) {
      console.warn('Failed to post message to BroadcastChannel:', err);
    }
  } else if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(msg));
    } catch (err) {
      // storage quota or private mode
    }
  }
}

/**
 * Subscribe to cross-tab event bus notifications
 */
export function subscribeBroadcast(handler: (msg: EventBusMessage) => void): () => void {
  subscribers.add(handler);
  return () => {
    subscribers.delete(handler);
  };
}
