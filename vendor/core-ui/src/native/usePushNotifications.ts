import { useState, useEffect, useCallback } from 'react';
import { apiClient, getWorkspaceFromUrl } from '../api/client';
import { isMobileDevice } from '../utils/device';
import { DeviceRegistrationPayload, PushNotificationData } from './types';

// Safely resolve Capacitor from window / global
export const getCapacitor = () => {
  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    return (window as any).Capacitor;
  }
  return null;
};

export const isNativePlatform = (): boolean => {
  const cap = getCapacitor();
  if (cap && typeof cap.isNativePlatform === 'function') {
    return cap.isNativePlatform();
  }
  return false;
};

export const getNativePlatform = (): 'android' | 'ios' | 'web' => {
  const cap = getCapacitor();
  if (cap && typeof cap.getPlatform === 'function') {
    const p = cap.getPlatform();
    if (p === 'android' || p === 'ios') return p;
  }
  return 'web';
};

export type NotificationPermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export const checkNotificationPermission = async (): Promise<NotificationPermissionState> => {
  if (isNativePlatform()) {
    const cap = getCapacitor();
    const PushNotifications = cap?.Plugins?.PushNotifications;
    if (PushNotifications && typeof PushNotifications.checkPermissions === 'function') {
      try {
        const result = await PushNotifications.checkPermissions();
        if (result && result.receive) {
          return result.receive as NotificationPermissionState;
        }
      } catch (err) {
        console.warn('Error checking native push permissions:', err);
      }
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    return window.Notification.permission as NotificationPermissionState;
  }

  return 'unsupported';
};

export const useNotificationPermission = () => {
  const [permission, setPermission] = useState<NotificationPermissionState>('prompt');
  const [isPhone, setIsPhone] = useState<boolean>(() => isNativePlatform() || isMobileDevice());

  const check = useCallback(async () => {
    const phone = isNativePlatform() || isMobileDevice();
    setIsPhone(phone);
    const perm = await checkNotificationPermission();
    setPermission(perm);
    return { phone, perm };
  }, []);

  useEffect(() => {
    check();

    const handleFocus = () => {
      check();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        check();
      }
    };

    const handleDeniedEvent = () => {
      check();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('notification_permission_denied', handleDeniedEvent);
    window.addEventListener('notification-permission-granted', handleDeniedEvent);

    const cap = getCapacitor();
    const App = cap?.Plugins?.App;
    let appListener: any;
    if (App && typeof App.addListener === 'function') {
      App.addListener('appStateChange', (state: any) => {
        if (state?.isActive) {
          check();
        }
      }).then((l: any) => { appListener = l; }).catch(() => {});
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('notification_permission_denied', handleDeniedEvent);
      window.removeEventListener('notification-permission-granted', handleDeniedEvent);
      appListener?.remove?.();
    };
  }, [check]);

  return {
    permission,
    isPhone,
    isDeniedOnPhone: isPhone && permission === 'denied',
    recheck: check,
  };
};

export const usePushNotifications = (onNavigate?: (route: string) => void) => {
  const { permission, isPhone, isDeniedOnPhone, recheck } = useNotificationPermission();
  const registerDeviceTokenWithBackend = useCallback(async (deviceToken: string) => {
    const token = localStorage.getItem('token');
    if (!token) return; // Wait until user is authenticated

    try {
      const platform = getNativePlatform();
      const payload: DeviceRegistrationPayload = {
        device_token: deviceToken,
        platform,
        device_model: navigator.userAgent,
        app_version: '1.0.0',
      };

      await apiClient.post('/notification/devices/register', payload, {
        headers: {
          'X-Tenant-Code': getWorkspaceFromUrl(),
        },
      });
      localStorage.setItem('fcm_device_token', deviceToken);
    } catch (err) {
      console.warn('Failed to register native device token with backend:', err);
    }
  }, []);

  const unregisterDeviceToken = useCallback(async () => {
    const savedToken = localStorage.getItem('fcm_device_token');
    if (!savedToken) return;

    try {
      await apiClient.post('/notification/devices/unregister', {
        device_token: savedToken,
      }, {
        headers: {
          'X-Tenant-Code': getWorkspaceFromUrl(),
        },
      });
      localStorage.removeItem('fcm_device_token');
    } catch (err) {
      console.warn('Failed to unregister native device token:', err);
    }
  }, []);

  useEffect(() => {
    if (!isNativePlatform()) return;

    const cap = getCapacitor();
    const PushNotifications = cap?.Plugins?.PushNotifications;
    if (!PushNotifications) return;

    // 1. Request notification permissions
    PushNotifications.requestPermissions().then((result: any) => {
      if (result.receive === 'granted') {
        PushNotifications.register();
        window.dispatchEvent(new Event('notification-permission-granted'));
      } else if (result.receive === 'denied') {
        window.dispatchEvent(new Event('notification_permission_denied'));
      }
    }).catch((err: any) => {
      console.warn('Error requesting native push permissions:', err);
    });

    // 2. Create High-Priority Notification Channels for Android with Sound & Vibration
    if (getNativePlatform() === 'android' && PushNotifications.createChannel) {
      PushNotifications.createChannel({
        id: 'geeksman_alerts',
        name: 'Critical Alerts & Orders',
        description: 'High-priority sound alerts for new chat messages, inquiries, and orders',
        importance: 5, // IMPORTANCE_HIGH
        visibility: 1, // VISIBILITY_PUBLIC
        sound: 'default',
        vibration: true,
        lights: true,
        lightColor: '#2563eb',
      }).catch(() => {});

      PushNotifications.createChannel({
        id: 'geeksman_chat',
        name: 'Chat & Messages',
        description: 'Real-time customer & staff chat messages',
        importance: 5,
        visibility: 1,
        sound: 'default',
        vibration: true,
        lights: true,
        lightColor: '#10b981',
      }).catch(() => {});
    }

    // 3. Foreground Notification Received Listener (Play Audio Chime)
    const receivedListener = PushNotifications.addListener?.('pushNotificationReceived', (_notification: any) => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.35);
        }
      } catch (err) {
        console.warn('Could not play notification audio chime:', err);
      }
    });

    // 4. Token Registration Listener
    const regListener = PushNotifications.addListener('registration', (tokenObj: { value: string }) => {
      if (tokenObj?.value) {
        registerDeviceTokenWithBackend(tokenObj.value);
      }
    });

    // 4. Notification Action Click Listener (Deep-Link Navigation)
    const actionListener = PushNotifications.addListener('pushNotificationActionPerformed', (notification: any) => {
      const data: PushNotificationData = notification.notification?.data || {};
      const targetRoute = data.route || data.url || data.link;
      if (targetRoute) {
        if (onNavigate) {
          onNavigate(targetRoute);
        } else if (typeof window !== 'undefined') {
          if (targetRoute.startsWith('/#')) {
            window.location.hash = targetRoute.replace('/#', '');
          } else if (targetRoute.startsWith('#')) {
            window.location.hash = targetRoute;
          } else if (targetRoute.startsWith('/')) {
            window.location.hash = `#${targetRoute}`;
          }
        }
      }
    });

    // 5. Re-register token on login event
    const handleLoginEvent = () => {
      const savedToken = localStorage.getItem('fcm_device_token');
      if (savedToken) {
        registerDeviceTokenWithBackend(savedToken);
      }
    };
    window.addEventListener('app_login_event', handleLoginEvent);

    return () => {
      regListener?.remove?.();
      actionListener?.remove?.();
      receivedListener?.remove?.();
      window.removeEventListener('app_login_event', handleLoginEvent);
    };
  }, [registerDeviceTokenWithBackend, onNavigate]);

  return {
    isNative: isNativePlatform(),
    platform: getNativePlatform(),
    unregisterDeviceToken,
    permission,
    isPhone,
    isDeniedOnPhone,
    recheckPermission: recheck,
  };
};
