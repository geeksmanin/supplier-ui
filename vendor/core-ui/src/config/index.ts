import { AppConfig, EnvironmentConfigs, EnvironmentType } from './types';

export * from './types';

/**
 * Checks whether a given tenant/workspace code is the generic "business" placeholder
 * or unselected.
 */
export const isBusinessWorkspace = (code?: string): boolean => {
  if (!code) return true;
  const clean = code.trim().toLowerCase();
  return clean === 'business' || clean === '' || clean === 'platform';
};

export const isBusinessTenant = isBusinessWorkspace;

/**
 * Explicitly extracts a tenant/workspace code candidate from a given URL or the active browser location.
 * Checks URL search parameters first (?workspace=xxx, ?tenant=xxx, ?tenant_code=xxx, or hash queries),
 * followed by hostname subdomain extraction.
 *
 * Returns the candidate string or null if not found.
 */
export const resolveTenantFromUrl = (targetUrl?: string): string | null => {
  if (typeof window === 'undefined' && !targetUrl) return null;

  try {
    let urlObj: URL | null = null;
    let search = '';
    let hash = '';
    let hostname = '';

    if (targetUrl) {
      try {
        urlObj = new URL(targetUrl, 'http://localhost');
        search = urlObj.search;
        hash = urlObj.hash;
        hostname = urlObj.hostname.toLowerCase();
      } catch (e) {
        return null;
      }
    } else if (typeof window !== 'undefined') {
      search = window.location.search;
      hash = window.location.hash;
      hostname = window.location.hostname.toLowerCase();
    }

    // 1. Check URL query parameters (?workspace=xxx, ?tenant=xxx, ?tenant_code=xxx)
    const searchParams = new URLSearchParams(search);
    let queryWs = searchParams.get('workspace') || searchParams.get('tenant') || searchParams.get('tenant_code');

    // Also check hash query (e.g. /#/login?workspace=synchx)
    if (!queryWs && hash.includes('?')) {
      const hashQuery = hash.split('?')[1];
      const hashParams = new URLSearchParams(hashQuery);
      queryWs = hashParams.get('workspace') || hashParams.get('tenant') || hashParams.get('tenant_code');
    }

    if (queryWs) {
      const clean = queryWs.trim().toLowerCase();
      if (clean) return clean;
    }

    // 2. Subdomain extraction from hostname (e.g. synchx.pos.geeksman.co.in or pos.a3pl.in)
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.endsWith('.localhost') && !isIp) {
      const parts = hostname.split('.');
      const appPrefixes = [
        'admin', 'platform', 'www', 'pos', 'samwad', 'samvad',
        'chat', 'staff', 'customer', 'portal', 'catalogue', 'catalog',
        'app', 'api', 'business', 'geeksman',
      ];
      if (parts.length > 1) {
        if (!appPrefixes.includes(parts[0])) {
          return parts[0];
        } else if (parts.length > 2 && !appPrefixes.includes(parts[1])) {
          return parts[1];
        }
      }
    }
  } catch (e) {}

  return null;
};

/**
 * Stores a valid organization tenant code in persistent storage and updates global configuration.
 * IMPORTANT: If "business" or empty is passed, it is NOT stored as an active organization tenant,
 * and instead marks the global configuration as unresolved (requires workspace selection).
 */
export const storeTenantCode = (tenantCode: string, tenantName?: string): boolean => {
  if (typeof window === 'undefined') return false;

  const isBusiness = isBusinessWorkspace(tenantCode);

  if (isBusiness) {
    // "business" is a generic placeholder and must NOT overwrite a real tenant in persistent storage.
    // Clean stale persisted tenant so global state cleanly enters workspace selection.
    try {
      localStorage.removeItem('tenant_code');
      localStorage.removeItem('tenant_name');
    } catch (e) {}

    const current = getAppConfig();
    const nextConfig: AppConfig = {
      ...current,
      tenantCode: 'business',
      tenantName: undefined,
      isTenantResolved: false,
      isBusinessWorkspace: true,
      requiresWorkspaceSelection: true,
      lastUsedWorkspace: current.lastUsedWorkspace,
      lastUsedWorkspaceName: current.lastUsedWorkspaceName,
    };

    (window as any).__geeksmanActiveConfig = nextConfig;
    window.dispatchEvent(new CustomEvent('app_config_change_event', { detail: nextConfig }));
    window.dispatchEvent(new CustomEvent('app_workspace_change_event', { detail: 'business' }));
    return false;
  }

  const clean = tenantCode.trim().toLowerCase();
  localStorage.setItem('tenant_code', clean);
  localStorage.setItem('last_used_workspace', clean);
  if (tenantName) {
    localStorage.setItem('tenant_name', tenantName);
    localStorage.setItem('last_used_workspace_name', tenantName);
  } else {
    localStorage.removeItem('tenant_name');
  }

  const current = getAppConfig();
  const nextConfig: AppConfig = {
    ...current,
    tenantCode: clean,
    tenantName,
    lastUsedWorkspace: clean,
    lastUsedWorkspaceName: tenantName || current.lastUsedWorkspaceName,
    isTenantResolved: true,
    isBusinessWorkspace: false,
    requiresWorkspaceSelection: false,
  };

  (window as any).__geeksmanActiveConfig = nextConfig;
  window.dispatchEvent(new CustomEvent('app_config_change_event', { detail: nextConfig }));
  window.dispatchEvent(new CustomEvent('app_workspace_change_event', { detail: clean }));
  return true;
};

/**
 * Explicitly resolves the tenant code from the URL and, if valid (non-business),
 * immediately stores it into persistent storage and updates the global config.
 * If the URL explicitly introduces "business", marks global configuration as requiring workspace selection.
 */
export const resolveAndStoreTenantFromUrl = (targetUrl?: string): string | null => {
  const candidate = resolveTenantFromUrl(targetUrl);
  if (!candidate) return null;

  if (isBusinessWorkspace(candidate)) {
    // If URL explicitly introduces "business", mark global configuration as requiring workspace selection
    storeTenantCode('business');
    return 'business';
  }

  storeTenantCode(candidate);
  return candidate;
};

/**
 * Clears any stored tenant code, resetting to the "business" unresolved state.
 */
export const clearTenantCode = (): void => {
  storeTenantCode('business');
};

/** Workspace aliases for API parity */
export const resolveWorkspaceFromUrl = resolveTenantFromUrl;
export const resolveAndStoreWorkspaceFromUrl = resolveAndStoreTenantFromUrl;
export const storeWorkspaceCode = storeTenantCode;
export const clearWorkspace = clearTenantCode;

/**
 * Resolves the active tenant code using strict waterfall priority:
 * 1. URL search params (?workspace=xxx, ?tenant=xxx, ?tenant_code=xxx)
 * 2. Subdomain extraction (e.g. synchx.pos.geeksman.co.in or pos.a3pl.in)
 * 3. Saved localStorage tenant
 * 4. Fallback defaultTenant from environment config
 */
export const resolveActiveTenantCode = (
  defaultTenant: string = 'platform',
  resolveFromUrl: boolean = true
): string => {
  if (typeof window === 'undefined') return defaultTenant;

  // 1 & 2: Check URL query and subdomain
  if (resolveFromUrl) {
    const urlTenant = resolveTenantFromUrl();
    if (urlTenant) {
      if (isBusinessWorkspace(urlTenant)) {
        // If URL explicitly introduces "business", clear any stale tenant in persistent storage
        try {
          localStorage.removeItem('tenant_code');
          localStorage.removeItem('tenant_name');
        } catch (e) {}
        return 'business';
      }
      localStorage.setItem('tenant_code', urlTenant);
      return urlTenant;
    }
  }

  // 3. Saved localStorage tenant (must not be "business")
  try {
    const saved = localStorage.getItem('tenant_code');
    if (saved && !isBusinessWorkspace(saved)) {
      return saved.trim().toLowerCase();
    }
  } catch (e) {}

  // 4. Default fallback
  return defaultTenant;
};

/**
 * Initializes the global application configuration.
 */
export const initializeConfig = <T = Record<string, any>>(config: AppConfig<T>): AppConfig<T> => {
  if (typeof window !== 'undefined') {
    const defaultTenant = config.defaultTenant || 'platform';
    const resolveFromUrl = config.resolveTenantFromUrl ?? true;

    if (!config.tenantCode) {
      config.tenantCode = resolveActiveTenantCode(defaultTenant, resolveFromUrl);
    }
    if (!config.tenantName && localStorage.getItem('tenant_name')) {
      config.tenantName = localStorage.getItem('tenant_name') || undefined;
    }
    if (!config.lastUsedWorkspace && typeof window !== 'undefined') {
      const savedLast = localStorage.getItem('last_used_workspace');
      if (savedLast && !isBusinessWorkspace(savedLast)) {
        config.lastUsedWorkspace = savedLast.trim().toLowerCase();
      }
    }
    if (!config.lastUsedWorkspaceName && typeof window !== 'undefined') {
      config.lastUsedWorkspaceName = localStorage.getItem('last_used_workspace_name') || undefined;
    }

    const isBusiness = isBusinessWorkspace(config.tenantCode);
    config.isBusinessWorkspace = isBusiness;
    config.isTenantResolved = !isBusiness && !!config.tenantCode;
    config.requiresWorkspaceSelection = isBusiness;

    (window as any).__geeksmanActiveConfig = config;
    window.dispatchEvent(new CustomEvent('app_config_change_event', { detail: config }));
  }
  return config;
};

/**
 * Synchronous primary source of truth for configuration across all apps.
 */
export const getAppConfig = <T = Record<string, any>>(): AppConfig<T> => {
  if (typeof window !== 'undefined') {
    let globalConfig = (window as any).__geeksmanActiveConfig as AppConfig<T> | undefined;
    if (!globalConfig) {
      const fallback: AppConfig<T> = {
        apiBaseUrl: '',
        defaultTenant: 'platform',
        resolveTenantFromUrl: true,
        environment: 'local',
      } as AppConfig<T>;
      (window as any).__geeksmanActiveConfig = fallback;
      globalConfig = fallback;
    }

    if (!globalConfig.tenantCode) {
      globalConfig.tenantCode = resolveActiveTenantCode(
        globalConfig.defaultTenant || 'platform',
        globalConfig.resolveTenantFromUrl ?? true
      );
    }

    if (!globalConfig.tenantName && localStorage.getItem('tenant_name')) {
      globalConfig.tenantName = localStorage.getItem('tenant_name') || undefined;
    }

    if (!globalConfig.lastUsedWorkspace && typeof window !== 'undefined') {
      const savedLast = localStorage.getItem('last_used_workspace');
      if (savedLast && !isBusinessWorkspace(savedLast)) {
        globalConfig.lastUsedWorkspace = savedLast.trim().toLowerCase();
      }
    }
    if (!globalConfig.lastUsedWorkspaceName && typeof window !== 'undefined') {
      globalConfig.lastUsedWorkspaceName = localStorage.getItem('last_used_workspace_name') || undefined;
    }

    const isBusiness = isBusinessWorkspace(globalConfig.tenantCode);
    globalConfig.isBusinessWorkspace = isBusiness;
    globalConfig.isTenantResolved = !isBusiness && !!globalConfig.tenantCode;
    globalConfig.requiresWorkspaceSelection = isBusiness;

    return globalConfig;
  }

  return {
    apiBaseUrl: '',
    defaultTenant: 'platform',
    resolveTenantFromUrl: false,
    environment: 'local',
    isBusinessWorkspace: false,
    isTenantResolved: false,
    requiresWorkspaceSelection: false,
  } as AppConfig<T>;
};

/**
 * Updates application configuration dynamically, persisting updates to storage
 * and broadcasting changes to all listening UI components.
 */
export const setAppConfig = <T = Record<string, any>>(updates: Partial<AppConfig<T>>): AppConfig<T> => {
  const current = getAppConfig<T>();
  const nextConfig: AppConfig<T> = {
    ...current,
    ...updates,
  };

  if (typeof window !== 'undefined') {
    if (updates.tenantCode !== undefined) {
      storeTenantCode(updates.tenantCode, updates.tenantName || current.tenantName);
      return getAppConfig<T>();
    }

    (window as any).__geeksmanActiveConfig = nextConfig;
    window.dispatchEvent(new CustomEvent('app_config_change_event', { detail: nextConfig }));
  }

  return nextConfig;
};

/**
 * Helper to switch active tenant/workspace and broadcast updates.
 */
export const setTenantCode = (tenantCode: string, tenantName?: string): boolean => {
  return storeTenantCode(tenantCode, tenantName);
};

/**
 * Resolves configuration from environment files (local, staging, prod, testing)
 * taking into account LAN IP dev servers, QA developer overrides, and build flags.
 */
export const resolveAppConfig = <T = Record<string, any>>(
  local: AppConfig<T>,
  staging: AppConfig<T>,
  prod: AppConfig<T>,
  testing?: AppConfig<T>
): AppConfig<T> => {
  const activeStaging: AppConfig<T> = { ...staging, environment: 'staging' as EnvironmentType };
  const activeTesting: AppConfig<T> = { ...(testing || staging), environment: 'testing' as EnvironmentType };
  const activeProd: AppConfig<T> = { ...prod, environment: 'production' as EnvironmentType };
  const activeLocal: AppConfig<T> = { ...local, environment: 'local' as EnvironmentType };

  // 1. Manual LocalStorage Override (for QA testers & dev toggling)
  if (typeof window !== 'undefined') {
    try {
      const override = localStorage.getItem('portal_override_backend_url') === 'true';
      const savedUrl = localStorage.getItem('portal_backend_url');
      if (override && savedUrl) {
        return {
          ...activeLocal,
          apiBaseUrl: savedUrl.replace(/\/$/, ''),
        };
      }
    } catch (e) {}
  }

  // 2. Local LAN IP / Wi-Fi Developer Server / Loopback
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    const isLanIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.endsWith('.local');
    const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '10.0.2.2' || host.endsWith('.localhost');

    if (isLanIp || isLocalHost) {
      const mapLocalUrl = (url?: string): string => {
        if (!url) return '';
        return url.replace(/localhost|127\.0\.0\.1|10\.0\.2\.2/, host);
      };

      return {
        ...activeLocal,
        apiBaseUrl: mapLocalUrl(activeLocal.apiBaseUrl),
        ticketingApiBaseUrl: activeLocal.ticketingApiBaseUrl ? mapLocalUrl(activeLocal.ticketingApiBaseUrl) : undefined,
        commentsApiBaseUrl: activeLocal.commentsApiBaseUrl ? mapLocalUrl(activeLocal.commentsApiBaseUrl) : undefined,
        notificationApiBaseUrl: activeLocal.notificationApiBaseUrl ? mapLocalUrl(activeLocal.notificationApiBaseUrl) : undefined,
      };
    }
  }

  // 3. Build-Time Environment Flags (Vite MODE / VITE_APP_ENV)
  let buildMode = '';
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env;
    buildMode = (env.VITE_APP_ENV || env.MODE || (env.PROD ? 'production' : '') || '').toLowerCase();

    if (buildMode === 'staging' || buildMode === 'stage') {
      return activeStaging;
    }
    if (buildMode === 'testing' || buildMode === 'test') {
      return activeTesting;
    }
    if (buildMode === 'production' || buildMode === 'prod' || env.PROD) {
      return activeProd;
    }
  }

  // 4. Default to Local Development
  return activeLocal;
};

/**
 * Convenience entry point to resolve and initialize environment configs in one shot.
 */
export const initAppConfig = <T = Record<string, any>>(configs: EnvironmentConfigs<T>): AppConfig<T> => {
  const resolved = resolveAppConfig<T>(configs.local, configs.staging, configs.prod, configs.testing);
  return initializeConfig<T>(resolved);
};
