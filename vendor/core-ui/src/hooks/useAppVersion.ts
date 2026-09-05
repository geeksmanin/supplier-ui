import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import { useToast } from '../components/Toast/Toast';

export interface BackendVersionData {
  commit_hash?: string;
  commit_message?: string;
  deployed_at?: string;
  [key: string]: any;
}

export interface AppVersionState {
  uiVersion: string;
  cacheId: string;
  backendVersion: BackendVersionData | null;
  isLoading: boolean;
  updateReady: boolean;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  checkForUpdates: () => Promise<void>;
  copySystemInfo: () => void;
}

export const useAppVersion = (): AppVersionState => {
  const [uiVersion, setUiVersion] = useState<string>('v1.0.0');
  const [cacheId, setCacheId] = useState<string>('local');
  const [backendVersion, setBackendVersion] = useState<BackendVersionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [updateReady, setUpdateReady] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { showToast } = useToast();

  // 1. Fetch and parse UI version from Service Worker
  useEffect(() => {
    let isMounted = true;

    const fetchUIVersion = async () => {
      try {
        const res = await fetch('/sw.js', { cache: 'no-store' });
        if (res.ok) {
          const text = await res.text();
          const match = text.match(/const CACHE_NAME = ['"]([^'"]+)['"]/);
          if (match && match[1]) {
            const cid = match[1];
            if (isMounted) {
              setCacheId(cid);
              const verMatch = cid.match(/v\d+\.\d+\.\d+/);
              if (verMatch) {
                setUiVersion(verMatch[0]);
              } else {
                setUiVersion(cid);
              }
            }
          }
        }
      } catch (err) {
        console.warn('[useAppVersion] Failed to read /sw.js:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchUIVersion();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Backend API version
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
        console.warn('[useAppVersion] Failed to fetch /api/v1/version:', err);
      }
    };

    fetchBackendVersion();

    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Listen for Service Worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
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

  // 4. Force check for updates and reload
  const checkForUpdates = useCallback(async () => {
    showToast('Checking for application updates...', 'info');
    if ('serviceWorker' in navigator) {
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

  // 5. Copy System Info helper for support/diagnostics
  const copySystemInfo = useCallback(() => {
    const info = {
      ui_version: uiVersion,
      sw_cache_id: cacheId,
      backend_commit: backendVersion?.commit_hash || 'unknown',
      backend_deployed_at: backendVersion?.deployed_at || 'unknown',
      origin: window.location.origin,
      pathname: window.location.hash || window.location.pathname,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };
    const text = JSON.stringify(info, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('System & version info copied to clipboard!', 'success');
    } else {
      showToast('Version: ' + uiVersion + ' | Commit: ' + (backendVersion?.commit_hash?.slice(0, 7) || 'N/A'), 'info');
    }
  }, [uiVersion, cacheId, backendVersion, showToast]);

  return {
    uiVersion,
    cacheId,
    backendVersion,
    isLoading,
    updateReady,
    modalOpen,
    setModalOpen,
    checkForUpdates,
    copySystemInfo,
  };
};
