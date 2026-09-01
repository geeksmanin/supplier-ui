import { useEffect, useCallback } from 'react';
import { apiClient, getWorkspaceFromUrl } from '../api/client';
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

export const usePushNotifications = (onNavigate?: (route: string) => void) => {
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
  };
};
