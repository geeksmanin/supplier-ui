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
  return cap?.Plugins?.App || (typeof window !== 'undefined' ? (window as any).App : null);
};

const getFilesystemPlugin = () => {
  const cap = getCapacitor();
  return cap?.Plugins?.Filesystem || (typeof window !== 'undefined' ? (window as any).Filesystem : null);
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
              setInstalledVersion(info.version || fallbackVersion);
              const buildNum = parseInt(info.build, 10);
              if (!isNaN(buildNum)) {
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

      // Check if remote version is newer than installed version
      const semverDiff = compareSemver(data.version, installedVersion);
      let isNewer = semverDiff > 0;

      // Also check build/version_code if available
      if (data.version_code && installedBuild > 0) {
        if (data.version_code > installedBuild) {
          isNewer = true;
        }
      }

      if (isNewer) {
        setUpdateAvailable(true);

        // Check if mandatory:
        // Either force_update is explicitly true, or installed version is lower than min_version
        let mandatory = !!data.force_update;
        if (data.min_version && compareSemver(data.min_version, installedVersion) > 0) {
          mandatory = true;
        }
        if (data.min_version_code && installedBuild > 0 && data.min_version_code > installedBuild) {
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
        // Fallback: open system browser
        window.open(resolvedUrl, '_system');
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
          console.warn('Native AppInstaller plugin failed, falling back to system browser:', nativeErr);
          window.open(resolvedUrl, '_system');
        }
      } else {
        window.open(resolvedUrl, '_system');
      }
    } catch (err: any) {
      console.error('In-app download & install failed:', err);
      setError(err?.message || 'Download failed');
      // Fallback: open system browser to download APK directly
      window.open(resolvedUrl, '_system');
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
