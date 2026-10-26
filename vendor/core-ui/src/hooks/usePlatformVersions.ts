import { useAppVersion } from './useAppVersion';

export interface PlatformVersionsState {
  webVersion: string;
  androidVersion: string;
  androidBuild: number | null;
  isNative: boolean;
  isLoading: boolean;
}

/**
 * @deprecated Use `useAppVersion()` from `@geeksman/core-ui`. It returns all 4 platforms (web, android, desktop, backend).
 */
export const usePlatformVersions = (versionUrl: string = '/downloads/version.json'): PlatformVersionsState => {
  const { webVersion, androidVersion, androidBuild, isNative, isLoading } = useAppVersion(versionUrl);

  return {
    webVersion,
    androidVersion,
    androidBuild,
    isNative,
    isLoading,
  };
};
