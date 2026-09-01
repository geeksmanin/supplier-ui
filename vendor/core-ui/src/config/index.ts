import { AppConfig } from './types';
import { isNativePlatform } from '../native/usePushNotifications';

export const initializeConfig = (config: AppConfig) => {
  if (typeof window !== 'undefined') {
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
      resolveTenantFromUrl: true,
    };
    (window as any).__geeksmanActiveConfig = fallback;
    return fallback;
  }
  return {
    apiBaseUrl: '',
    defaultTenant: 'platform',
    resolveTenantFromUrl: true,
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
        ...prod,
        apiBaseUrl: savedUrl.replace(/\/$/, ''),
      };
    }
  }

  // 2. Build-Time Environment Flags (Vite MODE / VITE_APP_ENV)
  let buildMode = '';
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env;
    buildMode = (env.VITE_APP_ENV || env.MODE || '').toLowerCase();

    if (buildMode === 'production' || buildMode === 'prod') {
      return prod;
    }
    if (buildMode === 'staging' || buildMode === 'stage') {
      return activeStaging;
    }
    if (buildMode === 'testing' || buildMode === 'test') {
      return activeTesting;
    }
  }

  // 3. Native Mobile Platform Safeguard (Capacitor Android/iOS)
  // On mobile devices, WebView localhost must NOT mistakenly bind to local machine's http://localhost:8089
  if (isNativePlatform()) {
    if (buildMode === 'staging' || buildMode === 'stage') {
      return activeStaging;
    }
    if (buildMode === 'testing' || buildMode === 'test') {
      return activeTesting;
    }
    // Default native builds to Production API
    return prod;
  }

  // 4. Web Browser / PWA Hostname Discovery
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    const port = window.location.port;

    if (
      host.includes('staging.') ||
      host.includes('-staging.') ||
      host.includes('.staging') ||
      port === '7082'
    ) {
      return activeStaging;
    }
    if (host.includes('testing.') || host.includes('-test.') || host.includes('.test.')) {
      return activeTesting;
    }
    if (host && host !== 'localhost' && host !== '127.0.0.1' && !host.endsWith('.localhost')) {
      return prod;
    }
  }

  // 5. Default to Local Development
  return local;
};

