import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import { isNativePlatform, getNativePlatform } from './usePushNotifications';

export interface AppVersionInfo {
  version: string;
  min_version?: string;
  download_url?: string;
  release_notes?: string;
  force_update?: boolean;
}

export const useAppUpdater = (currentVersion = '1.0.0') => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [versionInfo, setVersionInfo] = useState<AppVersionInfo | null>(null);

  const checkForUpdates = useCallback(async () => {
    try {
      const platform = getNativePlatform();
      const res = await apiClient.get(`/app/version?platform=${platform}`);
      const data = res.data?.data as AppVersionInfo;
      if (data && data.version && data.version !== currentVersion) {
        setVersionInfo(data);
        setUpdateAvailable(true);
      }
    } catch {
      // Ignore network errors when checking updates
    }
  }, [currentVersion]);

  useEffect(() => {
    if (isNativePlatform()) {
      checkForUpdates();
    }
  }, [checkForUpdates]);

  const downloadAndInstall = useCallback(() => {
    if (versionInfo?.download_url && typeof window !== 'undefined') {
      window.open(versionInfo.download_url, '_system');
    }
  }, [versionInfo]);

  return {
    updateAvailable,
    versionInfo,
    checkForUpdates,
    downloadAndInstall,
  };
};
