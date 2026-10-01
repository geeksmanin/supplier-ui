import { useState, useEffect, useCallback } from 'react';

export interface UseAppInstallPromptOptions {
  dismissStorageKey?: string;
  snoozeHours?: number;
  hasNativeApk?: boolean;
  apkDownloadUrl?: string;
  onInstallPwa?: () => void;
  onDownloadApk?: () => void;
}

export interface UseAppInstallPromptReturn {
  isStandalone: boolean;
  isDismissed: boolean;
  isInstallable: boolean;
  canPromptPwa: boolean;
  installPwa: () => Promise<boolean>;
  downloadApk: () => void;
  dismiss: () => void;
  resetDismiss: () => void;
  instructionText: string | null;
  clearInstructions: () => void;
}

export const checkIsStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return Boolean(
      window.matchMedia?.('(display-mode: standalone)')?.matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://') ||
      Boolean((window as any).Capacitor?.isNativePlatform?.()) ||
      Boolean((window as any).wails)
    );
  } catch (e) {
    return false;
  }
};

export const isIosSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isWebkit = /safari/.test(ua) && !/chrome|crios|fxios|android/.test(ua);
  return isIos && isWebkit;
};

export const isForceInstallRequested = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const search = window.location.search;
    const hash = window.location.hash;
    const params = new URLSearchParams(search);
    if (params.has('install') || params.has('banner') || params.has('prompt')) return true;
    if (hash.includes('?')) {
      const hashParams = new URLSearchParams(hash.split('?')[1]);
      if (hashParams.has('install') || hashParams.has('banner') || hashParams.has('prompt')) return true;
    }
  } catch (e) {}
  return false;
};

export const isLocalhostEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
};

export const showAppInstallBanner = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('show_app_install_banner'));
  }
};

export const useAppInstallPrompt = (options: UseAppInstallPromptOptions = {}): UseAppInstallPromptReturn => {
  const {
    dismissStorageKey = 'app_install_dismissed_until',
    snoozeHours = 24,
    apkDownloadUrl = '/downloads/app.apk',
    onInstallPwa,
    onDownloadApk,
  } = options;

  const isForced = isForceInstallRequested();
  const isLocalhost = isLocalhostEnvironment();

  // If forced or localhost, wipe stale dismissal from localStorage
  if (typeof window !== 'undefined' && (isForced || isLocalhost)) {
    try {
      localStorage.removeItem(dismissStorageKey);
    } catch (e) {}
  }

  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (isForced) return false;
    return checkIsStandalone();
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [instructionText, setInstructionText] = useState<string | null>(null);

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (isForced || isLocalhost) return false;
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem(dismissStorageKey);
      if (stored) {
        const until = Number(stored);
        if (!isNaN(until) && until > Date.now()) {
          return true;
        }
      }
    } catch (e) {}
    return false;
  });

  // Listen for programmatic open events (e.g. from header dropdown menu)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleForceOpen = () => {
      setIsDismissed(false);
      setIsStandalone(false);
      try {
        localStorage.removeItem(dismissStorageKey);
      } catch (e) {}
    };

    window.addEventListener('show_app_install_banner', handleForceOpen);
    window.addEventListener('show_app_install_prompt', handleForceOpen);

    return () => {
      window.removeEventListener('show_app_install_banner', handleForceOpen);
      window.removeEventListener('show_app_install_prompt', handleForceOpen);
    };
  }, [dismissStorageKey]);

  // Track standalone display mode changes
  useEffect(() => {
    if (typeof window === 'undefined' || isForced) return;

    const mq = window.matchMedia?.('(display-mode: standalone)');
    const handleDisplayChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches || checkIsStandalone());
    };

    if (mq?.addEventListener) {
      mq.addEventListener('change', handleDisplayChange);
      return () => mq.removeEventListener('change', handleDisplayChange);
    }
  }, [isForced]);

  // Capture beforeinstallprompt event
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger PWA installation
  const installPwa = useCallback(async (): Promise<boolean> => {
    if (onInstallPwa) onInstallPwa();

    if (deferredPrompt && typeof deferredPrompt.prompt === 'function') {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice?.outcome === 'accepted') {
          setIsStandalone(true);
          setDeferredPrompt(null);
          return true;
        }
        return false;
      } catch (err) {
        console.warn('[useAppInstallPrompt] Failed to trigger prompt:', err);
      }
    }

    // Fallback guidance if beforeinstallprompt is not supported or not yet triggered
    if (isIosSafari()) {
      setInstructionText('To install on iPhone/iPad: Tap the Share button (⎋ / ↑) at the bottom, then choose "Add to Home Screen".');
    } else {
      setInstructionText('To install: Tap your browser menu (⋮ or ...) and select "Install App" or "Add to Home screen".');
    }
    return false;
  }, [deferredPrompt, onInstallPwa]);

  // Download APK helper
  const downloadApk = useCallback(() => {
    if (onDownloadApk) onDownloadApk();
    if (typeof document !== 'undefined') {
      const link = document.createElement('a');
      link.href = apkDownloadUrl;
      link.setAttribute('download', apkDownloadUrl.split('/').pop() || 'app.apk');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [apkDownloadUrl, onDownloadApk]);

  // Dismiss install notice
  const dismiss = useCallback(() => {
    setIsDismissed(true);
    setInstructionText(null);
    // Don't snooze for 24h on localhost so developers can easily test on refresh
    const effectiveHours = isLocalhostEnvironment() ? 0 : snoozeHours;
    if (typeof window !== 'undefined' && effectiveHours > 0) {
      try {
        const snoozeUntil = Date.now() + effectiveHours * 3600 * 1000;
        localStorage.setItem(dismissStorageKey, String(snoozeUntil));
      } catch (e) {}
    }
  }, [dismissStorageKey, snoozeHours]);

  const resetDismiss = useCallback(() => {
    setIsDismissed(false);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(dismissStorageKey);
      } catch (e) {}
    }
  }, [dismissStorageKey]);

  const clearInstructions = useCallback(() => {
    setInstructionText(null);
  }, []);

  return {
    isStandalone,
    isDismissed,
    isInstallable: !isStandalone,
    canPromptPwa: Boolean(deferredPrompt),
    installPwa,
    downloadApk,
    dismiss,
    resetDismiss,
    instructionText,
    clearInstructions,
  };
};
