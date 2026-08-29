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
  stagingOrTesting: AppConfig,
  prod: AppConfig,
  optionalStaging?: AppConfig
): AppConfig => {
  const staging = optionalStaging || stagingOrTesting;
  const testing = optionalStaging ? stagingOrTesting : stagingOrTesting;

  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env;
    const mode = (env.VITE_APP_ENV || env.MODE || 'development').toLowerCase();

    if (mode === 'production' || mode === 'prod') {
      return prod;
    }
    if (mode === 'staging' || mode === 'stage') {
      return staging;
    }
    if (mode === 'testing' || mode === 'test') {
      return testing;
    }
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host.includes('staging.') || host.includes('-staging.')) {
      return staging;
    }
    if (host.includes('testing.') || host.includes('-test.')) {
      return testing;
    }
    if (host && host !== 'localhost' && host !== '127.0.0.1' && !host.endsWith('.localhost')) {
      return prod;
    }
  }

  return local;
};
