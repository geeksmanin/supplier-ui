import { useState, useEffect, useCallback } from 'react';
import {
  getAppConfig,
  setAppConfig,
  setTenantCode as updateTenantCode,
  storeTenantCode,
  storeWorkspaceCode,
  resolveTenantFromUrl,
  resolveWorkspaceFromUrl,
  resolveAndStoreTenantFromUrl,
  resolveAndStoreWorkspaceFromUrl,
  clearTenantCode,
  clearWorkspace,
  isBusinessWorkspace,
  isBusinessTenant,
  AppConfig,
} from '../config';

export { isBusinessTenant, isBusinessWorkspace } from '../config';

export interface UseAppConfigReturn<T = Record<string, any>> {
  /** The active resolved application configuration */
  config: AppConfig<T>;
  /** Resolved active API base URL */
  apiBaseUrl: string;
  /** Resolved active tenant / workspace code */
  tenantCode: string;
  /** Friendly organization / tenant name */
  tenantName?: string;
  /** Fallback default tenant code if none resolved */
  defaultTenant: string;
  /** Whether automatic tenant code resolution from browser URL / subdomain is enabled */
  resolveTenantFromUrlConfig: boolean;
  /** Active environment (local, staging, production, testing) */
  environment?: string;

  /** True if an actual organization tenant has been resolved (not "business" or empty) */
  isTenantResolved: boolean;
  /** True if the current tenant is the generic "business" placeholder */
  isBusinessWorkspace: boolean;
  /** Function to check whether a given code (or active tenant if omitted) is a generic business placeholder */
  isBusinessTenant: (code?: string) => boolean;
  /** True if the UI needs to display a workspace selection prompt */
  requiresWorkspaceSelection: boolean;

  /** Historical last used workspace code on this device (available even when on generic business portal) */
  lastUsedWorkspace?: string;
  /** Historical last used organization / tenant name */
  lastUsedWorkspaceName?: string;

  /** Explicitly extract a tenant candidate from a URL or active window location */
  resolveTenantFromUrl: (targetUrl?: string) => string | null;
  /** Alias for resolveTenantFromUrl */
  resolveWorkspaceFromUrl: (targetUrl?: string) => string | null;
  /** Extract tenant from URL and, if valid, store it into persistent storage and update config */
  resolveAndStoreTenantFromUrl: (targetUrl?: string) => string | null;
  /** Alias for resolveAndStoreTenantFromUrl */
  resolveAndStoreWorkspaceFromUrl: (targetUrl?: string) => string | null;
  /** Store a valid tenant code into storage and update global configuration */
  storeTenantCode: (tenantCode: string, tenantName?: string) => boolean;
  /** Alias for storeTenantCode */
  storeWorkspaceCode: (workspaceCode: string, tenantName?: string) => boolean;
  /** Clear active tenant code and reset to unresolved business placeholder */
  clearTenantCode: () => void;
  /** Alias for clearTenantCode */
  clearWorkspace: () => void;
  /** Update the active tenant code (alias for storeTenantCode) */
  setTenantCode: (tenantCode: string, tenantName?: string) => boolean;
  /** Dynamically update configuration properties */
  updateConfig: (updates: Partial<AppConfig<T>>) => void;
}

/**
 * Primary React hook for consuming and updating unified application configuration.
 * Automatically synchronizes across components via global custom events.
 *
 * @example
 * ```tsx
 * const {
 *   apiBaseUrl,
 *   tenantCode,
 *   isTenantResolved,
 *   requiresWorkspaceSelection,
 *   resolveAndStoreTenantFromUrl,
 * } = useAppConfig<POSConfig>();
 * ```
 */
export const useAppConfig = <T = Record<string, any>>(): UseAppConfigReturn<T> => {
  const [config, setConfigState] = useState<AppConfig<T>>(() => getAppConfig<T>());

  useEffect(() => {
    const handleConfigChange = (e: Event) => {
      const customEvent = e as CustomEvent<AppConfig<T>>;
      if (customEvent.detail) {
        setConfigState({ ...customEvent.detail });
      } else {
        setConfigState(getAppConfig<T>());
      }
    };

    window.addEventListener('app_config_change_event', handleConfigChange);
    window.addEventListener('app_workspace_change_event', handleConfigChange);

    return () => {
      window.removeEventListener('app_config_change_event', handleConfigChange);
      window.removeEventListener('app_workspace_change_event', handleConfigChange);
    };
  }, []);

  const handleSetTenantCode = useCallback((code: string, name?: string): boolean => {
    return updateTenantCode(code, name);
  }, []);

  const handleStoreTenantCode = useCallback((code: string, name?: string): boolean => {
    return storeTenantCode(code, name);
  }, []);

  const handleStoreWorkspaceCode = useCallback((code: string, name?: string): boolean => {
    return storeWorkspaceCode(code, name);
  }, []);

  const handleResolveFromUrl = useCallback((targetUrl?: string): string | null => {
    return resolveTenantFromUrl(targetUrl);
  }, []);

  const handleResolveWorkspaceFromUrl = useCallback((targetUrl?: string): string | null => {
    return resolveWorkspaceFromUrl(targetUrl);
  }, []);

  const handleResolveAndStoreFromUrl = useCallback((targetUrl?: string): string | null => {
    return resolveAndStoreTenantFromUrl(targetUrl);
  }, []);

  const handleResolveAndStoreWorkspaceFromUrl = useCallback((targetUrl?: string): string | null => {
    return resolveAndStoreWorkspaceFromUrl(targetUrl);
  }, []);

  const handleClearTenantCode = useCallback(() => {
    clearTenantCode();
  }, []);

  const handleClearWorkspace = useCallback(() => {
    clearWorkspace();
  }, []);

  const handleUpdateConfig = useCallback((updates: Partial<AppConfig<T>>) => {
    setAppConfig<T>(updates);
  }, []);

  const handleIsBusinessTenant = useCallback((code?: string): boolean => {
    return isBusinessTenant(code !== undefined ? code : config.tenantCode);
  }, [config.tenantCode]);

  const isBusiness = isBusinessWorkspace(config.tenantCode);

  return {
    config,
    apiBaseUrl: config.apiBaseUrl,
    tenantCode: config.tenantCode || config.defaultTenant || '',
    tenantName: config.tenantName,
    defaultTenant: config.defaultTenant || '',
    resolveTenantFromUrlConfig: config.resolveTenantFromUrl ?? true,
    environment: config.environment,

    isTenantResolved: !isBusiness && !!config.tenantCode,
    isBusinessWorkspace: isBusiness,
    isBusinessTenant: handleIsBusinessTenant,
    requiresWorkspaceSelection: isBusiness,

    lastUsedWorkspace: config.lastUsedWorkspace,
    lastUsedWorkspaceName: config.lastUsedWorkspaceName,

    resolveTenantFromUrl: handleResolveFromUrl,
    resolveWorkspaceFromUrl: handleResolveWorkspaceFromUrl,
    resolveAndStoreTenantFromUrl: handleResolveAndStoreFromUrl,
    resolveAndStoreWorkspaceFromUrl: handleResolveAndStoreWorkspaceFromUrl,
    storeTenantCode: handleStoreTenantCode,
    storeWorkspaceCode: handleStoreWorkspaceCode,
    clearTenantCode: handleClearTenantCode,
    clearWorkspace: handleClearWorkspace,
    setTenantCode: handleSetTenantCode,
    updateConfig: handleUpdateConfig,
  };
};
