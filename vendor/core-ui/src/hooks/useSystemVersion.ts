import { useAppVersion, AppVersionState, BackendVersionData } from './useAppVersion';

export type { BackendVersionData };
export type SystemVersionInfo = AppVersionState;

/**
 * Unified application and platform versioning hook.
 * Alias for `useAppVersion`.
 */
export const useSystemVersion = useAppVersion;
