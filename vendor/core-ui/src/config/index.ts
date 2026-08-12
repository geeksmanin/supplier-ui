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
  testing: AppConfig,
  prod: AppConfig
): AppConfig => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env;
    const mode = (env.VITE_APP_ENV || env.MODE || 'development').toLowerCase();

    if (mode === 'production' || mode === 'prod') {
      return prod;
    }
    if (mode === 'testing' || mode === 'test') {
      return testing;
    }
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1' && !host.endsWith('.localhost')) {
      return prod;
    }
  }

  return local;
};
