import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { createApiClient } from '@geeksman/core-ui';
import { Notification } from './types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  sseActive: boolean;
  tabLimitExceeded: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  unsubscribePush: () => Promise<void>;
  reconnectSSE: () => void;
  pushPermission: 'default' | 'granted' | 'denied';
  requestPushPermission: () => Promise<void>;
  registerListener: (filter: (n: Notification) => boolean, callback: (n: Notification) => void) => () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  baseUrl: string;
  userId: string;
  tenantCode: string;
  token?: string;
}

interface TabRegistry {
  [tabId: string]: number;
}

// Temporary pause for notification SSE streaming. Set to false to re-enable.
// Can also control via localStorage:
//   localStorage.setItem('notification_stream_paused', 'true' | 'false')
//   localStorage.setItem('notification_stream_paused_until', String(Date.now() + ms))
const NOTIFICATION_STREAM_TEMPORARILY_PAUSED = true;

const isNotificationStreamPaused = (): boolean => {
  if (typeof window === 'undefined') {
    return NOTIFICATION_STREAM_TEMPORARILY_PAUSED;
  }

  const override = localStorage.getItem('notification_stream_paused');
  if (override === 'false') return false;
  if (override === 'true') return true;

  const pausedUntil = localStorage.getItem('notification_stream_paused_until');
  if (pausedUntil && Date.now() < Number(pausedUntil)) return true;

  return NOTIFICATION_STREAM_TEMPORARILY_PAUSED;
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  baseUrl,
  userId,
  tenantCode,
  token,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sseActive, setSseActive] = useState(false);
  const [tabLimitExceeded, setTabLimitExceeded] = useState(false);
  const [pushPermission, setPushPermission] = useState<'default' | 'granted' | 'denied'>(
    typeof window !== 'undefined' && 'Notification' in window
      ? window.Notification.permission
      : 'default'
  );

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const backoffRef = useRef(1000);
  const tabIdRef = useRef(Math.random().toString(36).substring(2, 11));
  const tabHeartbeatIntervalRef = useRef<number | null>(null);
  const lastEventIdRef = useRef<string>('');
  
  const heartbeatTimeoutRef = useRef<number | null>(null);
  const lastHeartbeatTimeRef = useRef<number>(Date.now());

  const pendingNotificationsRef = useRef<Notification[]>([]);
  const throttleTimeoutRef = useRef<number | null>(null);
  const listenersRef = useRef<{ filter: (n: Notification) => boolean; callback: (n: Notification) => void }[]>([]);

  const fallbackPollingIntervalRef = useRef<number | null>(null);

  const api = createApiClient({ 
    suffix: '/notification',
    runtimeConfigKey: 'notificationApiBaseUrl'
  });

  const originalTitleRef = useRef(document.title);

  useEffect(() => {
    const baseTitle = document.title.replace(/^\(\d+\)\s*/, '');
    originalTitleRef.current = baseTitle;

    // Request notification permission for mobile PWA icon badging (required by iOS/Safari)
    if ('Notification' in window && window.Notification.permission === 'default') {
      window.Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          window.dispatchEvent(new Event('notification-permission-granted'));
        }
      }).catch((err) => {
        console.warn('Failed to request notification permission:', err);
      });
    }
  }, []);

  useEffect(() => {
    const baseTitle = originalTitleRef.current || document.title.replace(/^\(\d+\)\s*/, '');
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }, [unreadCount]);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const registerPushSubscription = async () => {
    if (!userId || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      
      const vapidPublicKey = 'BC4MgBodJ18udkvrc9VkP459PqoFn51JKpxwLjG5sYMa3nuaTDTc2BGpm7eKDy045etcIDKPd0aPs7Qmca1l5EI';
      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      const subJson = subscription.toJSON();
      if (!subJson.keys || !subJson.keys.p256dh || !subJson.keys.auth) {
        return;
      }

      await api.post('/subscribe', {
        endpoint: subJson.endpoint,
        p256dh: subJson.keys.p256dh,
        auth: subJson.keys.auth,
      });
      console.log('Successfully registered Web Push subscription with backend.');
    } catch (err) {
      console.error('Failed to subscribe to Web Push:', err);
    }
  };

  const requestPushPermission = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return;
    }
    try {
      const permission = await window.Notification.requestPermission();
      setPushPermission(permission);
      if (permission === 'granted') {
        window.dispatchEvent(new Event('notification-permission-granted'));
        await registerPushSubscription();
      }
    } catch (err) {
      console.warn('Failed to request notification permission:', err);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('');
      const rawItems = res.data?.data || [];
      const items = rawItems.map((n: Notification) => {
        if (n.metadata) {
          try {
            const meta = typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata;
            if (meta.entity_name) n.entity_name = meta.entity_name;
            if (meta.entity_id) n.entity_id = meta.entity_id;
          } catch (e) {}
        }
        return n;
      });

      setNotifications(items);
      if (items.length > 0) {
        lastEventIdRef.current = items[0].id;
      }
      setUnreadCount(items.filter((n: Notification) => !n.is_read).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    // Optimistic local state update immediately
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await api.post(`/${id}/read`);
    } catch (err) {
      console.error('Failed to mark notification as read on server:', err);
    }
  };

  const markAllAsRead = async () => {
    // Optimistic local state update immediately
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      await api.post('/read-all');
    } catch (err) {
      console.error('Failed to mark all as read on server:', err);
    }
  };

  const unsubscribePush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await api.post('/unsubscribe', {
          endpoint: subscription.endpoint,
        });
        console.log('Successfully unsubscribed from Web Push on backend and browser.');
      }
    } catch (err) {
      console.error('Failed to unsubscribe from Web Push:', err);
    }
  };

  const registerListener = (
    filter: (n: Notification) => boolean,
    callback: (n: Notification) => void
  ) => {
    const listener = { filter, callback };
    listenersRef.current.push(listener);
    return () => {
      listenersRef.current = listenersRef.current.filter((l) => l !== listener);
    };
  };

  const runTabChecks = (): boolean => {
    const now = Date.now();
    const tabId = tabIdRef.current;
    
    let registry: TabRegistry = {};
    try {
      const stored = localStorage.getItem('notification_active_tabs');
      if (stored) {
        registry = JSON.parse(stored);
      }
    } catch (e) {
      registry = {};
    }

    const cleanedRegistry: TabRegistry = {};
    Object.keys(registry).forEach((id) => {
      if (now - registry[id] < 8000) {
        cleanedRegistry[id] = registry[id];
      }
    });

    cleanedRegistry[tabId] = now;
    localStorage.setItem('notification_active_tabs', JSON.stringify(cleanedRegistry));

    const sortedTabIds = Object.keys(cleanedRegistry).sort();
    const tabIndex = sortedTabIds.indexOf(tabId);

    if (tabIndex >= 5) {
      setTabLimitExceeded(true);
      return false;
    }

    setTabLimitExceeded(false);
    return true;
  };

  const resetHeartbeatTimeout = () => {
    lastHeartbeatTimeRef.current = Date.now();
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }
    heartbeatTimeoutRef.current = window.setTimeout(() => {
      console.warn('SSE heartbeat lost (no event for 45s), forcing reconnect...');
      cleanupSSE();
      if (runTabChecks()) {
        connectSSE();
      }
    }, 45000);
  };

  const startFallbackPolling = () => {
    if (fallbackPollingIntervalRef.current) return;
    fallbackPollingIntervalRef.current = window.setInterval(() => {
      fetchNotifications();
    }, 60000);
  };

  const stopFallbackPolling = () => {
    if (fallbackPollingIntervalRef.current) {
      clearInterval(fallbackPollingIntervalRef.current);
      fallbackPollingIntervalRef.current = null;
    }
  };

  const connectSSE = () => {
    if (eventSourceRef.current) return;

    const tokenVal = token || localStorage.getItem('token') || '';
    if (!tokenVal) return;

    // Check if token is expired
    try {
      const payload = JSON.parse(atob(tokenVal.split('.')[1]));
      if (payload && payload.exp && Date.now() >= payload.exp * 1000) {
        console.warn('JWT token has expired, cleaning up SSE and logging out...');
        cleanupSSE();
        localStorage.removeItem('token');
        localStorage.removeItem('user_email');
        window.location.href = '/#/login';
        return;
      }
    } catch (e) {
      // Ignore parse errors and let the server handle it
    }

    const cleanBaseUrl = (baseUrl || '').replace(/\/$/, '');
    let streamUrl = `${cleanBaseUrl}/notification/stream?userId=${userId}`;
    if (tokenVal) {
      streamUrl += `&token=${tokenVal}`;
    }
    if (lastEventIdRef.current) {
      streamUrl += `&lastEventId=${lastEventIdRef.current}`;
    }

    const es = new EventSource(streamUrl);
    eventSourceRef.current = es;
    setSseActive(true);
    resetHeartbeatTimeout();

    es.addEventListener('connected', () => {
      backoffRef.current = 1000;
      resetHeartbeatTimeout();
    });

    es.addEventListener('keepalive', () => {
      resetHeartbeatTimeout();
    });

    es.addEventListener('notification', (e) => {
      try {
        resetHeartbeatTimeout();
        const envelope = JSON.parse(e.data);
        
        if (envelope.type === 'read_state_changed') {
          const targetId = envelope.payload?.id || envelope.event_id;
          setNotifications((prev) =>
            prev.map((n) => (n.id === targetId ? { ...n, is_read: true } : n))
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
          return;
        }

        if (envelope.type === 'read_all_state_changed') {
          setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
          setUnreadCount(0);
          return;
        }

        if (envelope.type === 'silent_sync' || (envelope.payload && envelope.payload.type === 'silent_sync')) {
          const syncNotif = envelope.payload || { type: 'silent_sync', link: envelope.link };
          const customEvent = new CustomEvent('notification_received', { detail: syncNotif });
          window.dispatchEvent(customEvent);
          return;
        }

        const notif: Notification = envelope.payload;
        if (!notif) return;

        if (notif.metadata) {
          try {
            const meta = typeof notif.metadata === 'string' ? JSON.parse(notif.metadata) : notif.metadata;
            if (meta.entity_name) notif.entity_name = meta.entity_name;
            if (meta.entity_id) notif.entity_id = meta.entity_id;
          } catch (e) {}
        }

        // Route chat notifications to the custom event immediately, bypassing global inbox
        if (notif.entity_name === 'staff_chat') {
          const customEvent = new CustomEvent('notification_received', { detail: notif });
          window.dispatchEvent(customEvent);
        }

        const activeTicketId = (window as any).activeTicketId;
        const activeChatId = (window as any).activeChatId;
        const isViewingActiveEntity = 
          (activeTicketId && notif.link && notif.link.toLowerCase().includes(activeTicketId.toLowerCase())) ||
          (activeChatId && notif.link && notif.link.toLowerCase().includes(activeChatId.toLowerCase())) ||
          (activeChatId && notif.entity_id && String(activeChatId).toLowerCase() === String(notif.entity_id).toLowerCase());

        if (isViewingActiveEntity) {
          notif.is_read = true;
          api.post(`/${notif.id}/read`).catch(() => {});
        }

        // Trigger any matching registered listeners
        listenersRef.current.forEach((listener) => {
          try {
            if (listener.filter(notif)) {
              listener.callback(notif);
            }
          } catch (e) {
            console.error('Error in notification listener callback:', e);
          }
        });

        pendingNotificationsRef.current.push(notif);

        if (!throttleTimeoutRef.current) {
          throttleTimeoutRef.current = window.setTimeout(() => {
            throttleTimeoutRef.current = null;
            const batch = pendingNotificationsRef.current;
            pendingNotificationsRef.current = [];

            setNotifications((prev) => {
              const filtered = batch.filter((item) => !prev.some((p) => p.id === item.id));
              if (filtered.length === 0) return prev;
              
              filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
              lastEventIdRef.current = filtered[filtered.length - 1].id;

              return [...filtered.reverse(), ...prev];
            });

            setUnreadCount((prev) => prev + batch.filter((item) => !item.is_read).length);

            const playNotificationSound = () => {
              try {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.15);
              } catch (e) {}
            };

            if (batch.length > 0) {
              playNotificationSound();
            }

            batch.forEach((item) => {
              if (item.is_read) return;

              const customEvent = new CustomEvent('notification_received', { detail: item });
              window.dispatchEvent(customEvent);
            });
          }, 100);
        }
      } catch (err) {
        console.error('Error parsing notification event payload:', err);
      }
    });

    es.onerror = () => {
      console.warn('SSE Connection error, attempting reconnection...');
      cleanupSSE();

      reconnectTimeoutRef.current = window.setTimeout(() => {
        backoffRef.current = Math.min(backoffRef.current * 2, 30000);
        if (runTabChecks()) {
          connectSSE();
        }
      }, backoffRef.current);
    };
  };

  const cleanupSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
    setSseActive(false);
  };

  const reconnectSSE = () => {
    cleanupSSE();
    if (runTabChecks()) {
      connectSSE();
    }
  };

  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    const initialAllowed = runTabChecks();
    if (initialAllowed) {
      connectSSE();
    } else {
      startFallbackPolling();
    }

    tabHeartbeatIntervalRef.current = window.setInterval(() => {
      const allowed = runTabChecks();
      if (allowed) {
        stopFallbackPolling();
        if (!eventSourceRef.current && !reconnectTimeoutRef.current) {
          connectSSE();
        }
      } else {
        cleanupSSE();
        startFallbackPolling();
      }
    }, 3000);

    let disconnectTimeout: number | null = null;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        disconnectTimeout = window.setTimeout(() => {
          cleanupSSE();
        }, 60000);
      } else {
        if (disconnectTimeout) {
          clearTimeout(disconnectTimeout);
          disconnectTimeout = null;
        }

        const allowed = runTabChecks();
        if (allowed) {
          stopFallbackPolling();
          if (!eventSourceRef.current || Date.now() - lastHeartbeatTimeRef.current > 30000) {
            cleanupSSE();
            connectSSE();
          }
        } else {
          cleanupSSE();
          startFallbackPolling();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cleanupSSE();
      stopFallbackPolling();
      if (tabHeartbeatIntervalRef.current) {
        clearInterval(tabHeartbeatIntervalRef.current);
      }
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      try {
        const stored = localStorage.getItem('notification_active_tabs');
        if (stored) {
          const registry: TabRegistry = JSON.parse(stored);
          delete registry[tabIdRef.current];
          localStorage.setItem('notification_active_tabs', JSON.stringify(registry));
        }
      } catch (e) {}
    };
  }, [baseUrl, userId, tenantCode, token]);

  useEffect(() => {
    if (!userId) return;

    const handlePermissionGranted = () => {
      registerPushSubscription();
    };
    window.addEventListener('notification-permission-granted', handlePermissionGranted);

    if ('Notification' in window && window.Notification.permission === 'granted') {
      registerPushSubscription();
    }

    return () => {
      window.removeEventListener('notification-permission-granted', handlePermissionGranted);
    };
  }, [userId]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        sseActive,
        tabLimitExceeded,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        unsubscribePush,
        reconnectSSE,
        pushPermission,
        requestPushPermission,
        registerListener,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
