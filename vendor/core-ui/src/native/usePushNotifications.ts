import { useState, useEffect, useCallback } from 'react';
import { apiClient, getWorkspaceFromUrl } from '../api/client';
import { isMobileDevice } from '../utils/device';
import { DeviceRegistrationPayload, PushNotificationData } from './types';

// Safely resolve Capacitor from window / global
export const getCapacitor = () => {
  if (typeof window !== 'undefined') {
    if ((window as any).Capacitor) return (window as any).Capacitor;
  }
  return null;
};

// Safely resolve PushNotifications plugin
export const getPushNotifications = () => {
  if (typeof window !== 'undefined') {
    if ((window as any).PushNotifications) return (window as any).PushNotifications;
    const cap = getCapacitor();
    if (cap?.Plugins?.PushNotifications) return cap.Plugins.PushNotifications;
    if (typeof cap?.registerPlugin === 'function') {
      try {
        return cap.registerPlugin('PushNotifications');
      } catch (e) {
        console.warn('Failed to dynamically register PushNotifications plugin:', e);
      }
    }
  }
  return null;
};

// Wait for Capacitor bridge to inject on native platforms
export const waitForCapacitor = async (maxWaitMs = 2000): Promise<any> => {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const cap = getCapacitor();
    if (cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) {
      return cap;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  return getCapacitor();
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
  const Push = getPushNotifications();
  if (Push && typeof Push.checkPermissions === 'function') {
    try {
      const result = await Push.checkPermissions();
      if (result && result.receive) {
        if (result.receive === 'prompt-with-rationale') return 'prompt';
        return result.receive as NotificationPermissionState;
      }
    } catch (err) {
      console.warn('Error checking native push permissions:', err);
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    const webPerm = window.Notification.permission;
    if (webPerm === 'default') return 'prompt';
    return webPerm as NotificationPermissionState;
  }

  // If in a mobile device or native container where Notification is not exposed
  if (isNativePlatform() || isMobileDevice()) {
    return 'prompt';
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

    // Recheck after Capacitor bridge has time to inject into WebView
    const timer1 = setTimeout(check, 400);
    const timer2 = setTimeout(check, 1200);
    const timer3 = setTimeout(check, 2500);
    waitForCapacitor(2500).then(() => {
      check();
    });

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
      try {
        const res = App.addListener('appStateChange', (state: any) => {
          if (state?.isActive) {
            check();
          }
        });
        if (res && typeof res.then === 'function') {
          res.then((l: any) => { appListener = l; }).catch(() => {});
        } else {
          appListener = res;
        }
      } catch (err) {
        console.warn('Could not register appStateChange listener', err);
      }
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('notification_permission_denied', handleDeniedEvent);
      window.removeEventListener('notification-permission-granted', handleDeniedEvent);
      if (appListener) {
        if (typeof appListener.remove === 'function') {
          appListener.remove();
        } else if (typeof appListener.then === 'function') {
          appListener.then((h: any) => h?.remove?.()).catch(() => {});
        }
      }
    };
  }, [check]);

  return {
    permission,
    isPhone,
    isDeniedOnPhone: isPhone && permission === 'denied',
    recheck: check,
  };
};

export interface UsePushNotificationsOptions {
  userType?: string;
}

export const usePushNotifications = (
  onNavigate?: (route: string) => void,
  options?: UsePushNotificationsOptions
) => {
  const { permission, isPhone, isDeniedOnPhone, recheck } = useNotificationPermission();

  const registerDeviceTokenWithBackend = useCallback(async (deviceToken: string) => {
    // Always store token locally
    localStorage.setItem('fcm_device_token', deviceToken);

    const token = localStorage.getItem('token') || localStorage.getItem('staff_token');
    if (!token) return; // Wait until user is authenticated

    try {
      const platform = getNativePlatform();
      const detectedUserType =
        options?.userType ||
        (localStorage.getItem('staff_token') || localStorage.getItem('staff_user_profile')
          ? 'staff'
          : undefined);

      const payload: DeviceRegistrationPayload = {
        device_token: deviceToken,
        platform,
        device_model: navigator.userAgent,
        app_version: '1.0.0',
        ...(detectedUserType ? { user_type: detectedUserType } : {}),
      };

      await apiClient.post('/notification/devices/register', payload, {
        headers: {
          'X-Tenant-Code': getWorkspaceFromUrl(),
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.warn('Failed to register native device token with backend:', err);
    }
  }, [options?.userType]);

  const unregisterDeviceToken = useCallback(async () => {
    const savedToken = localStorage.getItem('fcm_device_token');
    if (!savedToken) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('staff_token');
      await apiClient.post('/notification/devices/unregister', {
        device_token: savedToken,
      }, {
        headers: {
          'X-Tenant-Code': getWorkspaceFromUrl(),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      localStorage.removeItem('fcm_device_token');
    } catch (err) {
      console.warn('Failed to unregister native device token:', err);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermissionState> => {
    await waitForCapacitor(1500);
    const Push = getPushNotifications();
    if (Push && typeof Push.requestPermissions === 'function') {
      try {
        const result = await Push.requestPermissions();
        if (result?.receive === 'granted') {
          try {
            await Push.register();
          } catch (regErr) {
            console.warn('PushNotifications.register() failed:', regErr);
          }
          window.dispatchEvent(new Event('notification-permission-granted'));
          recheck();
          return 'granted';
        }
        recheck();
        return (result?.receive === 'prompt-with-rationale' ? 'prompt' : (result?.receive as NotificationPermissionState)) || 'denied';
      } catch (err) {
        console.warn('Error requesting native push permissions:', err);
      }
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          window.dispatchEvent(new Event('notification-permission-granted'));
        }
        recheck();
        return (perm === 'default' ? 'prompt' : (perm as NotificationPermissionState));
      } catch (err) {
        console.warn('Error requesting web notification permissions:', err);
      }
    }

    return 'unsupported';
  }, [recheck]);

  useEffect(() => {
    let unmounted = false;
    let regListener: any;
    let actionListener: any;
    let receivedListener: any;

    const init = async () => {
      await waitForCapacitor(2000);
      if (unmounted) return;

      const PushNotifications = getPushNotifications();
      const native = isNativePlatform();

      if (native && PushNotifications) {
        // 1. Setup listeners first so events are not missed
        try {
          const res = PushNotifications.addListener('registration', (tokenObj: { value: string }) => {
            if (tokenObj?.value) {
              registerDeviceTokenWithBackend(tokenObj.value);
            }
          });
          regListener = (res && typeof res.then === 'function') ? await res : res;
        } catch (e) {
          console.warn('Error adding registration listener:', e);
        }

        try {
          const res = PushNotifications.addListener('pushNotificationActionPerformed', (notification: any) => {
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
          actionListener = (res && typeof res.then === 'function') ? await res : res;
        } catch (e) {}

        try {
          const res = PushNotifications.addListener('pushNotificationReceived', (_notification: any) => {
            try {
              const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
              if (AudioCtx) {
                const ctx = new AudioCtx();
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
            } catch (err) {}
          });
          receivedListener = (res && typeof res.then === 'function') ? await res : res;
        } catch (e) {}

        // 2. Create High-Priority Notification Channels for Android
        if (getNativePlatform() === 'android' && PushNotifications.createChannel) {
          try {
            await PushNotifications.createChannel({
              id: 'geeksman_alerts',
              name: 'Critical Alerts & Orders',
              description: 'High-priority sound alerts for new chat messages, inquiries, and orders',
              importance: 5,
              visibility: 1,
              sound: 'default',
              vibration: true,
              lights: true,
              lightColor: '#2563eb',
            });
            await PushNotifications.createChannel({
              id: 'geeksman_chat',
              name: 'Chat & Messages',
              description: 'Real-time customer & staff chat messages',
              importance: 5,
              visibility: 1,
              sound: 'default',
              vibration: true,
              lights: true,
              lightColor: '#10b981',
            });
          } catch (e) {}
        }

        // 3. Request permissions & Register
        try {
          const permResult = await PushNotifications.requestPermissions();
          if (permResult?.receive === 'granted') {
            try {
              await PushNotifications.register();
            } catch (regErr) {
              console.warn('PushNotifications.register() failed:', regErr);
            }
            window.dispatchEvent(new Event('notification-permission-granted'));
            recheck();
          } else if (permResult?.receive === 'denied') {
            window.dispatchEvent(new Event('notification_permission_denied'));
            recheck();
          }
        } catch (err) {
          console.warn('Error requesting native push permissions:', err);
        }
      } else if (typeof window !== 'undefined' && 'Notification' in window) {
        // Fallback for regular web browsers
        if (Notification.permission === 'default') {
          Notification.requestPermission().then((res) => {
            if (res === 'granted') {
              window.dispatchEvent(new Event('notification-permission-granted'));
            }
            recheck();
          }).catch(() => {});
        }
      }

      // 4. Auto-register saved token if authenticated
      const initialSavedToken = localStorage.getItem('fcm_device_token');
      const initialAuthToken = localStorage.getItem('token') || localStorage.getItem('staff_token');
      if (initialSavedToken && initialAuthToken) {
        registerDeviceTokenWithBackend(initialSavedToken);
      }
    };

    init();

    // 5. Re-register token on login event
    const handleLoginEvent = () => {
      const savedToken = localStorage.getItem('fcm_device_token');
      if (savedToken) {
        registerDeviceTokenWithBackend(savedToken);
      }
    };
    window.addEventListener('app_login_event', handleLoginEvent);

    return () => {
      unmounted = true;
      if (regListener) {
        if (typeof regListener.remove === 'function') regListener.remove();
        else if (typeof regListener.then === 'function') regListener.then((h: any) => h?.remove?.()).catch(() => {});
      }
      if (actionListener) {
        if (typeof actionListener.remove === 'function') actionListener.remove();
        else if (typeof actionListener.then === 'function') actionListener.then((h: any) => h?.remove?.()).catch(() => {});
      }
      if (receivedListener) {
        if (typeof receivedListener.remove === 'function') receivedListener.remove();
        else if (typeof receivedListener.then === 'function') receivedListener.then((h: any) => h?.remove?.()).catch(() => {});
      }
      window.removeEventListener('app_login_event', handleLoginEvent);
    };
  }, [registerDeviceTokenWithBackend, onNavigate, recheck]);

  return {
    isNative: isNativePlatform(),
    platform: getNativePlatform(),
    unregisterDeviceToken,
    requestPermission,
    permission,
    isPhone,
    isDeniedOnPhone,
    recheckPermission: recheck,
  };
};
