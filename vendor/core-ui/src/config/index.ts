import { AppConfig } from './types';

export const initializeConfig = (config: AppConfig) => {
  if (typeof window !== 'undefined') {
    if (!config.tenantCode && config.defaultTenant) {
      config.tenantCode = config.defaultTenant;
    }
    (window as any).__geeksmanActiveConfig = config;
  }
};

export const getAppConfig = (): AppConfig => {
  if (typeof window !== 'undefined') {
    const globalConfig = (window as any).__geeksmanActiveConfig;
    if (globalConfig) return globalConfig;
    
    const fallback = {
      apiBaseUrl: '',
      defaultTenant: 'platform',
      resolveTenantFromUrl: false,
    };
    (window as any).__geeksmanActiveConfig = fallback;
    return fallback;
  }
  return {
    apiBaseUrl: '',
    defaultTenant: 'platform',
    resolveTenantFromUrl: false,
  };
};

export const resolveAppConfig = (
  local: AppConfig,
  staging: AppConfig,
  prod: AppConfig,
  testing?: AppConfig
): AppConfig => {
  const activeStaging = staging;
  const activeTesting = testing || staging;

  // 1. Manual LocalStorage Override (for QA testers & dev toggling)
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('portal_override_backend_url') === 'true';
    const savedUrl = localStorage.getItem('portal_backend_url');
    if (override && savedUrl) {
      return {
        ...local,
        apiBaseUrl: savedUrl.replace(/\/$/, ''),
      };
    }
  }

  // 2. Local LAN IP / Wi-Fi Developer Server / Loopback
  // When the app is loaded from a local Wi-Fi IP (e.g. 192.168.1.15), loopback, or emulator (10.0.2.2),
  // resolve all endpoints directly from config.local.ts by mapping localhost / 127.0.0.1 / 10.0.2.2 to the active LAN host.
  // Staging and testing environments are resolved exclusively via build-time VITE_APP_ENV (section 3 below).
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
        ...local,
        apiBaseUrl: mapLocalUrl(local.apiBaseUrl),
        ticketingApiBaseUrl: local.ticketingApiBaseUrl ? mapLocalUrl(local.ticketingApiBaseUrl) : undefined,
        commentsApiBaseUrl: local.commentsApiBaseUrl ? mapLocalUrl(local.commentsApiBaseUrl) : undefined,
        notificationApiBaseUrl: local.notificationApiBaseUrl ? mapLocalUrl(local.notificationApiBaseUrl) : undefined,
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
      return prod;
    }
  }

  // 4. Default to Local Development
  return local;
};

