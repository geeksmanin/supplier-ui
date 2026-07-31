import { AppConfig } from './types';

let activeConfig: AppConfig | null = null;

export const initializeConfig = (config: AppConfig) => {
  activeConfig = config;
};

export const getAppConfig = (): AppConfig => {
  if (!activeConfig) {
    activeConfig = {
      apiBaseUrl: '',
      defaultTenant: 'platform',
      resolveTenantFromUrl: true,
    };
  }
  return activeConfig;
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
