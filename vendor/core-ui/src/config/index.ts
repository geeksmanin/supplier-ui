import { AppConfig } from './types';

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

  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env;
    const mode = (env.VITE_APP_ENV || env.MODE || 'development').toLowerCase();

    if (mode === 'production' || mode === 'prod') {
      return prod;
    }
    if (mode === 'staging' || mode === 'stage') {
      return activeStaging;
    }
    if (mode === 'testing' || mode === 'test') {
      return activeTesting;
    }
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host.includes('staging.') || host.includes('-staging.') || host.includes('.staging')) {
      return activeStaging;
    }
    if (host.includes('testing.') || host.includes('-test.') || host.includes('.test.')) {
      return activeTesting;
    }
    if (host && host !== 'localhost' && host !== '127.0.0.1' && !host.endsWith('.localhost')) {
      return prod;
    }
  }

  return local;
};
