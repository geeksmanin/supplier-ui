import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import { useToast } from '../components/Toast/Toast';
import { isNativePlatform, getCapacitor, waitForCapacitor } from '../native/platform';

export interface BackendVersionData {
  commit_hash?: string;
  commit_message?: string;
  deployed_at?: string;
  environment?: string;
  branch?: string;
  version?: string;
  [key: string]: any;
}

export interface AppVersionState {
  /** 1. Web / UI Version derived from /sw.js or /version.json */
  webVersion: string;
  /** Backward compatible alias for webVersion */
  uiVersion: string;
  /** Extended alias for webVersion */
  webAppVersion: string;

  /** Service Worker cache name identifier */
  swCacheId: string;
  /** Backward compatible alias for swCacheId */
  cacheId: string;

  /** 2. Android Version derived from Capacitor or /downloads/version.json */
  androidVersion: string;
  /** Extended alias for androidVersion */
  androidAppVersion: string;
  /** Android version_code / build integer */
  androidBuild: number | null;

  /** 3. Desktop Version for Wails shell runtime */
  desktopVersion: string;
  /** Extended alias for desktopVersion */
  desktopAppVersion: string;

  /** 4. Backend API Version dynamically resolved from apiClient.get('/version') */
  backendVersion: BackendVersionData | null;

  /** Active runtime platform */
  activePlatform: 'web' | 'android' | 'desktop';
  /** True if running inside native mobile shell */
  isNative: boolean;
  /** True if running inside native Android shell */
  isNativeAndroid: boolean;
  /** True if running inside desktop shell (Wails) */
  isDesktop: boolean;

  /** Indicates if background version requests are pending */
  isLoading: boolean;
  /** True if a newer Service Worker is waiting to activate */
  updateReady: boolean;
  /** Modal visibility state */
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;

  /** Force check for Service Worker updates and trigger reload */
  checkForUpdates: () => Promise<void>;
  /** Copy system diagnostics and runtime details to clipboard */
  copySystemInfo: () => void;
  /** Alias for copySystemInfo */
  copyDiagnostics: () => void;
}

/**
 * Unified application versioning hook for all platforms:
 * 1. Web PWA (derived from /sw.js and fallback /version.json)
 * 2. Android App (derived from native Capacitor App.getInfo() or /downloads/version.json)
 * 3. Desktop App (derived from Wails desktop shell runtime)
 * 4. Backend API (dynamically queried via configured apiClient.get('/version'))
 */
export const useAppVersion = (apkVersionUrl: string = '/downloads/version.json'): AppVersionState => {
  const [webVersion, setWebVersion] = useState<string>('v1.0.0');
  const [swCacheId, setSwCacheId] = useState<string>('local');
  const [androidVersion, setAndroidVersion] = useState<string>('');
  const [androidBuild, setAndroidBuild] = useState<number | null>(null);
  const [desktopVersion, setDesktopVersion] = useState<string>('');
  const [backendVersion, setBackendVersion] = useState<BackendVersionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [updateReady, setUpdateReady] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const { showToast } = useToast();
  const isNative = isNativePlatform();

  const isDesktop = typeof window !== 'undefined' && (
    !!(window as any).wails ||
    window.location.hostname === 'wails' ||
    window.location.protocol === 'wails:' ||
    window.location.hostname.includes('wails')
  );

  const activePlatform: 'web' | 'android' | 'desktop' = isDesktop
    ? 'desktop'
    : isNative
    ? 'android'
    : 'web';

  // 1. Derive Web App Version from /sw.js (fallback to /version.json)
  useEffect(() => {
    let isMounted = true;

    const fetchWebVersion = async () => {
      try {
        const res = await fetch('/sw.js', { cache: 'no-store' });
        if (res.ok) {
          const text = await res.text();
          const match = text.match(/const CACHE_NAME = ['"]([^'"]+)['"]/);
          if (match && match[1]) {
            const cid = match[1];
            if (isMounted) {
              setSwCacheId(cid);
              const verMatch = cid.match(/v\d+\.\d+\.\d+/) || cid.match(/\d+\.\d+\.\d+/);
              if (verMatch) {
                setWebVersion(verMatch[0].startsWith('v') ? verMatch[0] : `v${verMatch[0]}`);
              } else {
                setWebVersion(cid);
              }
            }
            return;
          }
        }
      } catch (err) {
        // Fallback to /version.json below
      }

      try {
        const vRes = await fetch(`/version.json?_t=${Date.now()}`);
        if (vRes.ok) {
          const vData = await vRes.json();
          if (isMounted && vData?.version) {
            setWebVersion(vData.version.startsWith('v') ? vData.version : `v${vData.version}`);
          }
        }
      } catch (e) {}
    };

    fetchWebVersion();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Derive Android App Version from native Capacitor or published APK manifest
  useEffect(() => {
    let isMounted = true;

    const fetchAndroidVersion = async () => {
      let resolvedVersion = '';
      let resolvedBuild: number | null = null;

      // A. If running inside native Android shell, query runtime package details directly
      if (isNative) {
        await waitForCapacitor(1500);
        try {
          const cap = getCapacitor();
          const AppPlugin = cap?.Plugins?.App || (window as any).App;
          if (AppPlugin && typeof AppPlugin.getInfo === 'function') {
            const info = await AppPlugin.getInfo();
            if (isMounted && info) {
              if (info.version) {
                resolvedVersion = info.version.startsWith('v') ? info.version : `v${info.version}`;
              }
              const b = parseInt(info.build, 10);
              if (!isNaN(b) && b > 0) resolvedBuild = b;
            }
          }
        } catch (e) {}
      }

      // B. Also query published APK manifest for web clients / downloads
      try {
        const res = await fetch(`${apkVersionUrl}?_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data) {
            if (!resolvedVersion && data.version) {
              resolvedVersion = data.version.startsWith('v') ? data.version : `v${data.version}`;
            }
            if (resolvedBuild === null && data.version_code) {
              resolvedBuild = data.version_code;
            }
          }
        }
      } catch (e) {}

      if (isMounted) {
        setAndroidVersion(resolvedVersion);
        setAndroidBuild(resolvedBuild);
      }
    };

    fetchAndroidVersion();
    return () => {
      isMounted = false;
    };
  }, [isNative, apkVersionUrl]);

  // 3. Derive Backend Version dynamically via apiClient.get('/version')
  useEffect(() => {
    let isMounted = true;

    const fetchBackendVersion = async () => {
      try {
        const res = await apiClient.get('/version');
        const data = res.data?.data || res.data;
        if (isMounted && data) {
          setBackendVersion(data);
        }
      } catch (err) {
        console.warn('[useAppVersion] Could not fetch backend /version:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchBackendVersion();
    return () => {
      isMounted = false;
    };
  }, []);

  // 4. Derive Desktop App Version (Wails shell or placeholder)
  useEffect(() => {
    if (isDesktop) {
      const wailsVer =
        (window as any).__WAILS_APP_VERSION__ ||
        (window as any).wails?.AppVersion ||
        'v1.0.0';
      setDesktopVersion(wailsVer.startsWith('v') ? wailsVer : `v${wailsVer}`);
    } else {
      setDesktopVersion('');
    }
  }, [isDesktop]);

  // 5. Watch for Service Worker updates
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg?.waiting) {
          setUpdateReady(true);
        }
      }).catch(() => {});

      const handleControllerChange = () => {
        setUpdateReady(false);
      };
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, []);

  // 6. Action: Check for updates and force reload
  const checkForUpdates = useCallback(async () => {
    showToast('Checking for application updates...', 'info');
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            showToast('New update downloaded! Reloading...', 'success');
            setTimeout(() => window.location.reload(), 500);
            return;
          }
        }
      } catch (err) {
        console.warn('[useAppVersion] Error checking SW update:', err);
      }
    }
    showToast('App is currently up to date.', 'success');
    setTimeout(() => window.location.reload(), 800);
  }, [showToast]);

  // 7. Action: Copy formatted diagnostic report to clipboard
  const copySystemInfo = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      activePlatform,
      webVersion,
      swCacheId,
      androidVersion: androidVersion ? `${androidVersion}${androidBuild ? ` (${androidBuild})` : ''}` : 'N/A',
      desktopVersion: desktopVersion || 'N/A',
      backendVersion: {
        commit_hash: backendVersion?.commit_hash || 'unknown',
        commit_message: backendVersion?.commit_message || 'unknown',
        deployed_at: backendVersion?.deployed_at || 'unknown',
        environment: backendVersion?.environment || 'unknown',
      },
      origin: typeof window !== 'undefined' ? window.location.origin : '',
      pathname: typeof window !== 'undefined' ? (window.location.hash || window.location.pathname) : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    const text = JSON.stringify(report, null, 2);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('System diagnostics copied to clipboard!', 'success');
    } else {
      showToast(`Web: ${webVersion} | Commit: ${backendVersion?.commit_hash?.slice(0, 7) || 'N/A'}`, 'info');
    }
  }, [activePlatform, webVersion, swCacheId, androidVersion, androidBuild, desktopVersion, backendVersion, showToast]);

  return {
    webVersion,
    uiVersion: webVersion,
    webAppVersion: webVersion,
    swCacheId,
    cacheId: swCacheId,
    androidVersion,
    androidAppVersion: androidVersion,
    androidBuild,
    desktopVersion,
    desktopAppVersion: desktopVersion,
    backendVersion,
    activePlatform,
    isNative,
    isNativeAndroid: isNative,
    isDesktop,
    isLoading,
    updateReady,
    modalOpen,
    setModalOpen,
    checkForUpdates,
    copySystemInfo,
    copyDiagnostics: copySystemInfo,
  };
};
