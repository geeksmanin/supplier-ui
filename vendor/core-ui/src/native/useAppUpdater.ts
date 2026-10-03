import { useState, useEffect, useCallback } from 'react';
import { isNativePlatform, getCapacitor } from './usePushNotifications';

export enum Directory {
  Documents = 'DOCUMENTS',
  Data = 'DATA',
  Library = 'LIBRARY',
  Cache = 'CACHE',
  External = 'EXTERNAL',
  ExternalStorage = 'EXTERNAL_STORAGE',
}

export interface AppVersionInfo {
  app_name?: string;
  package_id?: string;
  version: string;
  version_code?: number;
  min_version?: string;
  min_version_code?: number;
  download_url?: string;
  apk_url?: string;
  release_notes?: string;
  changelog?: string;
  force_update?: boolean;
}

interface AppInstallerPluginInterface {
  installApk(options: { filePath: string }): Promise<void>;
}

const getAppPlugin = () => {
  const cap = getCapacitor();
  if (cap?.Plugins?.App) return cap.Plugins.App;
  if (typeof cap?.registerPlugin === 'function') {
    try {
      return cap.registerPlugin('App');
    } catch (e) {
      console.warn('Failed to dynamically register App plugin:', e);
    }
  }
  return typeof window !== 'undefined' ? (window as any).App : null;
};

const getFilesystemPlugin = () => {
  const cap = getCapacitor();
  if (cap?.Plugins?.Filesystem) return cap.Plugins.Filesystem;
  if (typeof cap?.registerPlugin === 'function') {
    try {
      return cap.registerPlugin('Filesystem');
    } catch (e) {
      console.warn('Failed to dynamically register Filesystem plugin:', e);
    }
  }
  return typeof window !== 'undefined' ? (window as any).Filesystem : null;
};

const getAppInstallerPlugin = (): AppInstallerPluginInterface | null => {
  const cap = getCapacitor();
  if (cap?.Plugins?.AppInstaller) return cap.Plugins.AppInstaller;
  if (typeof cap?.registerPlugin === 'function') {
    try {
      return cap.registerPlugin('AppInstaller');
    } catch (e) {
      console.warn('Failed to dynamically register AppInstaller plugin:', e);
    }
  }
  return typeof window !== 'undefined' ? (window as any).AppInstaller : null;
};

/**
 * openExternalUrl
 * Opens a URL outside the WebView in the most reliable way available.
 * Priority: Capacitor App.openUrl → Capacitor Browser.open → window.open(_blank)
 * This is the correct replacement for window.open(url, '_system') which silently
 * fails to trigger the Android package installer in many Capacitor environments.
 */
async function openExternalUrl(url: string): Promise<void> {
  const cap = getCapacitor();
  // 1. Try Capacitor App.openUrl (triggers system intent — opens APK installer on Android)
  const AppPlugin = getAppPlugin();
  if (AppPlugin && typeof AppPlugin.openUrl === 'function') {
    try {
      await AppPlugin.openUrl({ url });
      return;
    } catch (e) {
      console.warn('App.openUrl failed, trying Browser:', e);
    }
  }
  // 2. Try Capacitor Browser plugin
  const BrowserPlugin = cap?.Plugins?.Browser ||
    (typeof cap?.registerPlugin === 'function' ? (() => { try { return cap.registerPlugin('Browser'); } catch { return null; } })() : null) ||
    (typeof window !== 'undefined' ? (window as any).CapacitorBrowser : null);
  if (BrowserPlugin && typeof BrowserPlugin.open === 'function') {
    try {
      await BrowserPlugin.open({ url });
      return;
    } catch (e) {
      console.warn('Browser.open failed, falling back to window.open:', e);
    }
  }
  // 3. Last resort
  window.open(url, '_blank');
}

/**
 * Compare two semver strings (e.g. "1.0.2" vs "1.0.1").
 * Returns >0 if v1 > v2, <0 if v1 < v2, and 0 if equal.
 */
export function compareSemver(v1 = '0.0.0', v2 = '0.0.0'): number {
  const clean1 = v1.replace(/^[vV]/, '').split('-')[0];
  const clean2 = v2.replace(/^[vV]/, '').split('-')[0];
  const parts1 = clean1.split('.').map((p) => parseInt(p, 10) || 0);
  const parts2 = clean2.split('.').map((p) => parseInt(p, 10) || 0);
  const maxLen = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLen; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

export interface UseAppUpdaterOptions {
  versionUrl?: string;
  fallbackVersion?: string;
  autoCheck?: boolean;
}

export const useAppUpdater = (options: UseAppUpdaterOptions = {}) => {
  const {
    versionUrl = '/downloads/version.json',
    fallbackVersion = '1.0.0',
    autoCheck = true,
  } = options;

  const [installedVersion, setInstalledVersion] = useState<string>(fallbackVersion);
  const [installedBuild, setInstalledBuild] = useState<number>(1);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [isMandatory, setIsMandatory] = useState<boolean>(false);
  const [versionInfo, setVersionInfo] = useState<AppVersionInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(false);

  // 1. Resolve current installed native app version via Capacitor App plugin
  useEffect(() => {
    let mounted = true;
    async function loadInstalledInfo() {
      if (isNativePlatform()) {
        try {
          const AppPlugin = getAppPlugin();
          if (AppPlugin && typeof AppPlugin.getInfo === 'function') {
            const info = await AppPlugin.getInfo();
            if (mounted && info) {
              if (info.version) {
                setInstalledVersion(info.version);
              }
              const buildNum = parseInt(info.build, 10);
              if (!isNaN(buildNum) && buildNum > 0) {
                setInstalledBuild(buildNum);
              }
            }
          }
        } catch (err) {
          console.warn('Failed to get native App info:', err);
        }
      }
    }
    loadInstalledInfo();
    return () => {
      mounted = false;
    };
  }, [fallbackVersion]);

  // 2. Fetch and compare remote version
  const checkForUpdates = useCallback(async () => {
    setError(null);
    try {
      // Add cache buster timestamp
      const url = `${versionUrl}?_t=${Date.now()}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        return;
      }
      const data: AppVersionInfo = await res.json();
      if (!data || !data.version) {
        return;
      }

      setVersionInfo(data);

      // Resolve live native app version directly to avoid initial render race conditions
      let currentVersion = installedVersion;
      let currentBuild = installedBuild;
      if (isNativePlatform()) {
        try {
          const AppPlugin = getAppPlugin();
          if (AppPlugin && typeof AppPlugin.getInfo === 'function') {
            const info = await AppPlugin.getInfo();
            if (info) {
              if (info.version) {
                currentVersion = info.version;
                setInstalledVersion(info.version);
              }
              const buildNum = parseInt(info.build, 10);
              if (!isNaN(buildNum) && buildNum > 0) {
                currentBuild = buildNum;
                setInstalledBuild(buildNum);
              }
            }
          }
        } catch (err) {
          console.warn('Failed to get native App info during update check:', err);
        }
      }

      // Check if remote version is newer than installed version
      const semverDiff = compareSemver(data.version, currentVersion);
      let isNewer = semverDiff > 0;

      // Also check build/version_code if available
      if (data.version_code && currentBuild > 0) {
        if (data.version_code > currentBuild) {
          isNewer = true;
        } else if (data.version_code <= currentBuild && semverDiff <= 0) {
          // Explicit safeguard: if remote build is <= installed build and semver is not newer, do not trigger update
          isNewer = false;
        }
      }

      if (isNewer) {
        setUpdateAvailable(true);

        // Check if mandatory:
        // Either force_update is explicitly true, or installed version is lower than min_version
        let mandatory = !!data.force_update;
        if (data.min_version && compareSemver(data.min_version, currentVersion) > 0) {
          mandatory = true;
        }
        if (data.min_version_code && currentBuild > 0 && data.min_version_code > currentBuild) {
          mandatory = true;
        }
        setIsMandatory(mandatory);
      } else {
        setUpdateAvailable(false);
        setIsMandatory(false);
      }
    } catch (err: any) {
      console.warn('Update check failed (silent):', err);
    }
  }, [versionUrl, installedVersion, installedBuild]);

  // Run autoCheck on mount and on resume
  useEffect(() => {
    if (isNativePlatform() && autoCheck) {
      checkForUpdates();

      // Listen for app state changes (resume from background)
      let resumeListener: any = null;
      try {
        const AppPlugin = getAppPlugin();
        if (AppPlugin && typeof AppPlugin.addListener === 'function') {
          const res = AppPlugin.addListener('appStateChange', (state: any) => {
            if (state?.isActive) {
              checkForUpdates();
            }
          });
          if (res && typeof res.then === 'function') {
            res.then((handle: any) => {
              resumeListener = handle;
            }).catch(() => {});
          } else {
            resumeListener = res;
          }
        }
      } catch {
        // App listener may not be supported on web
      }

      return () => {
        if (resumeListener?.remove) {
          resumeListener.remove();
        }
      };
    }
  }, [autoCheck, checkForUpdates]);

  // 3. In-App Download and Install Handler
  const downloadAndInstall = useCallback(async () => {
    const apkUrl = versionInfo?.apk_url || versionInfo?.download_url;
    if (!apkUrl) {
      setError('No APK download URL provided in version info');
      return;
    }

    // Resolve full URL if relative
    let baseUrl = window.location.origin;
    if (versionUrl && versionUrl.startsWith('http')) {
      try {
        baseUrl = new URL(versionUrl).origin;
      } catch {}
    }
    const resolvedUrl = apkUrl.startsWith('http')
      ? apkUrl
      : `${baseUrl}${apkUrl.startsWith('/') ? '' : '/'}${apkUrl}`;

    setIsDownloading(true);
    setDownloadProgress(0);
    setError(null);

    try {
      const response = await fetch(resolvedUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch APK: HTTP ${response.status}`);
      }

      const contentLengthHeader = response.headers.get('content-length');
      const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let receivedBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          receivedBytes += value.length;
          if (totalBytes > 0) {
            const pct = Math.min(100, Math.round((receivedBytes / totalBytes) * 100));
            setDownloadProgress(pct);
          } else {
            // Indeterminate progress simulation up to 90%
            setDownloadProgress((prev) => Math.min(90, prev + 5));
          }
        }
      }

      setDownloadProgress(100);

      // Concatenate chunks
      const allChunks = new Uint8Array(receivedBytes);
      let position = 0;
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }

      // Convert to base64 for Capacitor Filesystem write
      let binary = '';
      const len = allChunks.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(allChunks[i]);
      }
      const base64Data = btoa(binary);

      const fileName = `update-${versionInfo?.version || 'latest'}.apk`;

      const Filesystem = getFilesystemPlugin();
      if (!Filesystem || typeof Filesystem.writeFile !== 'function') {
        // Filesystem plugin unavailable — open directly via external intent
        await openExternalUrl(resolvedUrl);
        return;
      }

      // Write APK into application Cache directory
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
      });

      // Get content/file URI
      const uriResult = await Filesystem.getUri({
        path: fileName,
        directory: Directory.Cache,
      });

      // Invoke native AppInstallerPlugin to start Android Package Installer
      const AppInstaller = getAppInstallerPlugin();
      if (AppInstaller && typeof AppInstaller.installApk === 'function') {
        try {
          await AppInstaller.installApk({ filePath: uriResult.uri });
        } catch (nativeErr: any) {
          console.warn('Native AppInstaller plugin failed, falling back to external URL:', nativeErr);
          await openExternalUrl(resolvedUrl);
        }
      } else {
        // AppInstaller plugin not registered — open APK URL via system intent
        await openExternalUrl(resolvedUrl);
      }
    } catch (err: any) {
      console.error('In-app download & install failed:', err);
      setError(err?.message || 'Download failed');
      await openExternalUrl(resolvedUrl);
    } finally {
      setIsDownloading(false);
    }
  }, [versionInfo, versionUrl]);

  const dismissUpdate = useCallback(() => {
    if (!isMandatory) {
      setDismissed(true);
    }
  }, [isMandatory]);

  return {
    updateAvailable: updateAvailable && (!dismissed || isMandatory),
    isMandatory,
    installedVersion,
    installedBuild,
    latestVersion: versionInfo?.version || '',
    changelog: versionInfo?.changelog || versionInfo?.release_notes || '',
    versionInfo,
    isDownloading,
    downloadProgress,
    error,
    checkForUpdates,
    downloadAndInstall,
    dismissUpdate,
  };
};
