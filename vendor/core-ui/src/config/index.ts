import { AppConfig } from './types';
import { isNativePlatform } from '../native/platform';

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

  // 2. Hostname / Network Discovery (Web, PWA, or Native WebView loaded from LAN / Dev Server)
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    const port = window.location.port;

    // A. Explicit Staging hostnames
    if (
      host.includes('staging.') ||
      host.includes('-staging.') ||
      host.includes('.staging') ||
      port === '7082'
    ) {
      return activeStaging;
    }

    // B. Explicit Testing hostnames
    if (host.includes('testing.') || host.includes('-test.') || host.includes('.test.')) {
      return activeTesting;
    }

    // C. Local LAN IP / Wi-Fi Developer Server / Loopback
    // When the app is loaded from a local Wi-Fi IP (e.g. 192.168.1.15), loopback, or emulator (10.0.2.2),
    // ALWAYS resolve to the local backend on that same host rather than falling back to production cloud.
    const isLanIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.endsWith('.local');
    const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '10.0.2.2' || host.endsWith('.localhost');

    if (isLanIp || isLocalHost) {
      let localPort = '8082';
      try {
        if (local.apiBaseUrl) {
          const parsedUrl = new URL(local.apiBaseUrl);
          if (parsedUrl.port) {
            localPort = parsedUrl.port;
          }
        }
      } catch (e) {
        // ignore
      }
      return {
        ...local,
        apiBaseUrl: `http://${host}:${localPort}/api/v1`,
        ticketingApiBaseUrl: `http://${host}:${localPort}/api/v1/ticketing`,
        commentsApiBaseUrl: `http://${host}:${localPort}/api/v1/comments`,
        notificationApiBaseUrl: `http://${host}:${localPort}`,
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

  // 4. Native Mobile Platform Safeguard (Capacitor Android/iOS bundled assets)
  // When running bundled assets inside native app (not pointed to local LAN), default to Prod
  if (isNativePlatform()) {
    if (buildMode === 'staging' || buildMode === 'stage') {
      return activeStaging;
    }
    if (buildMode === 'testing' || buildMode === 'test') {
      return activeTesting;
    }
    return prod;
  }

  // 5. Default to Local Development
  return local;
};

