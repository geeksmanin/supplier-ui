import { useState, useEffect } from 'react';
import { useAppVersion } from './useAppVersion';
import { isNativePlatform, getCapacitor, waitForCapacitor } from '../native/platform';

export interface PlatformVersionsState {
  webVersion: string;
  androidVersion: string;
  androidBuild: number | null;
  isNative: boolean;
  isLoading: boolean;
}

export const usePlatformVersions = (versionUrl: string = '/downloads/version.json'): PlatformVersionsState => {
  const { uiVersion } = useAppVersion();
  const [androidVersion, setAndroidVersion] = useState<string>('');
  const [androidBuild, setAndroidBuild] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isNative = isNativePlatform();

  useEffect(() => {
    let mounted = true;

    async function loadVersion() {
      // 1. Fetch versionUrl (e.g. /downloads/version.json) to obtain latest published Android APK details
      try {
        const res = await fetch(`${versionUrl}?_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (mounted && data?.version) {
            setAndroidVersion(data.version);
            if (data.version_code) setAndroidBuild(data.version_code);
          }
        }
      } catch (e) {}

      // 2. If running inside native Android shell, query installed APK runtime info
      if (isNative) {
        await waitForCapacitor(1500);
        try {
          const cap = getCapacitor();
          const AppPlugin = cap?.Plugins?.App || (window as any).App;
          if (AppPlugin && typeof AppPlugin.getInfo === 'function') {
            const info = await AppPlugin.getInfo();
            if (mounted && info) {
              if (info.version) setAndroidVersion(info.version);
              const b = parseInt(info.build, 10);
              if (!isNaN(b) && b > 0) setAndroidBuild(b);
            }
          }
        } catch (e) {}
      }

      if (mounted) setIsLoading(false);
    }

    loadVersion();
    return () => {
      mounted = false;
    };
  }, [isNative, versionUrl]);

  const cleanWebVersion = uiVersion ? (uiVersion.startsWith('v') ? uiVersion : `v${uiVersion}`) : 'v1.0.0';

  return {
    webVersion: cleanWebVersion,
    androidVersion,
    androidBuild,
    isNative,
    isLoading,
  };
};
