import { useState, useEffect, useCallback } from 'react';
import { getAppConfig } from '../config';
import { DevServerPreset, DevServerTab } from './DevServerModal.types';

export interface UseDevServerModalParams {
  isOpen: boolean;
  onClose: () => void;
  defaultProductionUrl: string;
  defaultStagingUrl?: string;
  appName: string;
}

export function useDevServerModal({
  isOpen,
  onClose,
  defaultProductionUrl,
  defaultStagingUrl,
  appName,
}: UseDevServerModalParams) {
  const [activeTab, setActiveTab] = useState<DevServerTab>('server');
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<DevServerPreset>('custom');
  const [customInput, setCustomInput] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.port) {
      return `http://192.168.1.15:${window.location.port}`;
    }
    return 'http://192.168.1.15:3004';
  });
  const [isCapacitor, setIsCapacitor] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [diagnosticsText, setDiagnosticsText] = useState<string>('');
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState<boolean>(false);
  const [isErudaActive, setIsErudaActive] = useState<boolean>(false);
  const [isErudaLoading, setIsErudaLoading] = useState<boolean>(false);

  const effectiveStagingUrl = defaultStagingUrl || defaultProductionUrl.replace('business.', 'staging.');

  const initSelection = useCallback((url: string) => {
    if (url === defaultProductionUrl) {
      setSelectedPreset('prod');
    } else if (url === effectiveStagingUrl) {
      setSelectedPreset('staging');
    } else if (url.includes('10.0.2.2')) {
      setSelectedPreset('emulator');
    } else {
      setSelectedPreset('custom');
      setCustomInput(url);
    }
  }, [defaultProductionUrl, effectiveStagingUrl]);

  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg('');
    setStatusMsg('');
    setDiagnosticsText('');
    setIsClearConfirmOpen(false);
    const cap = (window as any).Capacitor;
    const isNative = Boolean(cap?.isNativePlatform && cap.isNativePlatform());
    setIsCapacitor(isNative);

    const win = window as any;
    setIsErudaActive(Boolean(win.eruda?._isInit && document.getElementById('eruda')?.style.display !== 'none'));

    const fallbackRead = () => {
      const saved =
        localStorage.getItem('geeksman_server_url') ||
        localStorage.getItem('portal_backend_url') ||
        defaultProductionUrl;
      setCurrentUrl(saved);
      initSelection(saved);
    };

    if (cap?.Plugins?.DevServer?.getServerUrl) {
      cap.Plugins.DevServer.getServerUrl()
        .then((res: { url?: string }) => {
          const active = res.url || defaultProductionUrl;
          setCurrentUrl(active);
          initSelection(active);
        })
        .catch(fallbackRead);
    } else {
      fallbackRead();
    }
  }, [isOpen, defaultProductionUrl, initSelection]);

  const toggleEruda = () => {
    const win = window as any;
    if (win.eruda) {
      const el = document.getElementById('eruda');
      if (el) {
        const isHidden = el.style.display === 'none';
        el.style.display = isHidden ? 'block' : 'none';
        setIsErudaActive(isHidden);
        if (isHidden) win.eruda.show();
      } else {
        win.eruda.show();
        setIsErudaActive(true);
      }
      onClose();
      return;
    }

    setIsErudaLoading(true);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/eruda';
    script.onload = () => {
      setIsErudaLoading(false);
      win.eruda?.init();
      win.eruda?.show();
      setIsErudaActive(true);
      onClose();
    };
    script.onerror = () => {
      setIsErudaLoading(false);
      setErrorMsg('Failed to load Eruda from CDN. Please check your network connection.');
    };
    document.body.appendChild(script);
  };

  const copyDiagnostics = async () => {
    const data = {
      appName,
      platform: isCapacitor ? 'Capacitor Android Shell' : 'Web Browser',
      activeUrl: currentUrl || defaultProductionUrl,
      backendUrl: localStorage.getItem('portal_backend_url') || 'Default',
      backendOverride: localStorage.getItem('portal_override_backend_url') || 'false',
      origin: window.location.origin,
      pathname: window.location.hash || window.location.pathname,
      userAgent: navigator.userAgent,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      storageKeyCount: localStorage.length,
      timestamp: new Date().toISOString(),
    };
    const serialized = JSON.stringify(data, null, 2);
    setDiagnosticsText(serialized);
    try {
      await navigator.clipboard?.writeText(serialized);
      setStatusMsg('Diagnostic report copied to clipboard.');
    } catch {
      setStatusMsg('Clipboard unavailable — copy report below.');
    }
  };

  const confirmClearCacheAndReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const resolveBackendUrl = (targetHost: string): string => {
    const activeApiUrl = getAppConfig().apiBaseUrl;
    if (activeApiUrl && /localhost|127\.0\.0\.1|10\.0\.2\.2/.test(activeApiUrl)) {
      return activeApiUrl
        .replace(/localhost|127\.0\.0\.1|10\.0\.2\.2/, targetHost)
        .replace(/\/$/, '');
    }
    try {
      const pathname = activeApiUrl ? new URL(activeApiUrl).pathname.replace(/\/$/, '') : '/api/v1';
      return `http://${targetHost}${pathname}`;
    } catch {
      return `http://${targetHost}/api/v1`;
    }
  };

  const handleSave = async () => {
    let target = '';
    if (selectedPreset === 'prod') target = defaultProductionUrl;
    else if (selectedPreset === 'staging') target = effectiveStagingUrl;
    else if (selectedPreset === 'emulator') {
      const vitePort = window.location.port || '5173';
      target = `http://10.0.2.2:${vitePort}`;
    } else {
      target = customInput.trim();
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = `http://${target}`;
      }
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(target);
    } catch {
      setErrorMsg('Please enter a valid URL (e.g., http://192.168.1.50:5173)');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const normalizedTarget = target.replace(/\/+$/, '');
      const normalizedProd = defaultProductionUrl.replace(/\/+$/, '');
      if (selectedPreset === 'prod' || normalizedTarget === normalizedProd) {
        localStorage.removeItem('geeksman_server_url');
        localStorage.removeItem('portal_override_backend_url');
        localStorage.removeItem('portal_backend_url');

        const cap = (window as any).Capacitor;
        if (isCapacitor && cap?.Plugins?.DevServer?.resetServerUrl) {
          await cap.Plugins.DevServer.resetServerUrl();
          setIsSaving(false);
          onClose();
          return;
        }

        setTimeout(() => {
          window.location.href = defaultProductionUrl;
        }, 300);
        return;
      }

      localStorage.setItem('geeksman_server_url', target);

      if (selectedPreset === 'staging') {
        localStorage.setItem('portal_override_backend_url', 'true');
        localStorage.setItem('portal_backend_url', 'https://staging.erpapi.geeksman.co.in/api/v1');
      } else if (selectedPreset === 'emulator') {
        localStorage.setItem('portal_override_backend_url', 'true');
        localStorage.setItem('portal_backend_url', resolveBackendUrl('10.0.2.2'));
      } else {
        localStorage.setItem('portal_override_backend_url', 'true');
        localStorage.setItem('portal_backend_url', resolveBackendUrl(parsedUrl.hostname));
      }

      const cap = (window as any).Capacitor;
      if (isCapacitor && cap?.Plugins?.DevServer?.setServerUrl) {
        await cap.Plugins.DevServer.setServerUrl({ url: target });
        setIsSaving(false);
        onClose();
        return;
      }

      setTimeout(() => {
        window.location.href = target;
      }, 300);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to switch server. Check connection.');
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    localStorage.removeItem('geeksman_server_url');
    localStorage.removeItem('portal_backend_url');
    localStorage.removeItem('portal_override_backend_url');

    try {
      const cap = (window as any).Capacitor;
      if (isCapacitor && cap?.Plugins?.DevServer?.resetServerUrl) {
        await cap.Plugins.DevServer.resetServerUrl();
        setIsSaving(false);
        onClose();
        return;
      }
      setTimeout(() => {
        window.location.href = defaultProductionUrl;
      }, 300);
    } catch {
      window.location.href = defaultProductionUrl;
    }
  };

  return {
    activeTab,
    setActiveTab,
    currentUrl,
    selectedPreset,
    setSelectedPreset,
    customInput,
    setCustomInput,
    isCapacitor,
    isSaving,
    errorMsg,
    statusMsg,
    diagnosticsText,
    isClearConfirmOpen,
    setIsClearConfirmOpen,
    isErudaActive,
    isErudaLoading,
    effectiveStagingUrl,
    toggleEruda,
    copyDiagnostics,
    confirmClearCacheAndReset,
    handleSave,
    handleReset,
  };
}
