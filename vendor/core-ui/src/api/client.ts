import axios from 'axios';
import { getAppConfig } from '../config';

declare global {
  interface Window {
    runtimeConfig?: {
      apiBaseUrl?: string;
      tenantCode?: string;
    };
  }
}

export const getDefaultBackendUrl = (): string => {
  return getAppConfig().apiBaseUrl;
};

export const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host.includes('dev.');

    const override = localStorage.getItem('portal_override_backend_url') === 'true';
    const savedUrl = localStorage.getItem('portal_backend_url');
    if (override && savedUrl) {
      return savedUrl.replace(/\/$/, '');
    }

    const config = window.runtimeConfig as any;
    if (config?.apiBaseUrl) {
      const url = config.apiBaseUrl;
      if (isLocalHost || (!url.includes('localhost') && !url.includes('127.0.0.1'))) {
        return url.replace(/\/$/, '');
      }
    }
  }
  return getDefaultBackendUrl();
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getWorkspaceFromUrl = (): string => {
  return getAppConfig().tenantCode || 'platform';
};

export const resolveTenantCodeFromServer = async (): Promise<string> => {
  if (typeof window === 'undefined') return 'platform';

  const config = getAppConfig();
  if (!config.resolveTenantFromUrl) {
    const defaultTenant = config.defaultTenant || 'platform';
    config.tenantCode = defaultTenant;
    return defaultTenant;
  }

  try {
    const response = await axios.get(`${getBaseUrl()}/tenant/resolve`, {
      params: {
        host: window.location.host,
      },
      headers: {
        'X-Tenant-Code': 'platform',
      }
    });

    const tenantCode = response.data?.data?.tenant_code;
    if (tenantCode) {
      config.tenantCode = tenantCode;
      return tenantCode;
    }
  } catch (err) {
    console.warn('Failed to resolve tenant from backend, falling back to default:', err);
  }

  const fallbackTenant = config.defaultTenant || 'platform';
  config.tenantCode = fallbackTenant;
  return fallbackTenant;
};

// Configure client request interceptors to auto-populate tokens and tenant code if stored
apiClient.interceptors.request.use((config) => {
  // Dynamically evaluate baseURL on every request to pick up runtime updates
  config.baseURL = getBaseUrl();

  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Resolve tenant code from current hostname subdomain or localStorage setting
  if (config.headers) {
    config.headers['X-Tenant-Code'] = getWorkspaceFromUrl();
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Configure client response interceptor to handle 401 unauthorized errors
apiClient.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user_email');
    if (typeof window !== 'undefined') {
      if (!window.location.hash.includes('/login')) {
        window.location.hash = '#/login';
        window.location.reload();
      }
    }
  }
  return Promise.reject(error);
});

export interface CreateClientOptions {
  suffix: string; // e.g. '/ticketing' or '/comments'
  runtimeConfigKey?: string; // e.g. 'ticketingApiBaseUrl' or 'commentsApiBaseUrl'
}

export const createApiClient = (options: CreateClientOptions) => {
  const getBaseUrl = (): string => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host.includes('dev.');

      const override = localStorage.getItem('portal_override_backend_url') === 'true';
      const savedUrl = localStorage.getItem('portal_backend_url');
      if (override && savedUrl) {
        return `${savedUrl.replace(/\/$/, '')}${options.suffix}`;
      }

      const config = window.runtimeConfig as any;
      if (options.runtimeConfigKey && config?.[options.runtimeConfigKey]) {
        const url = config[options.runtimeConfigKey];
        if (isLocalHost || (!url.includes('localhost') && !url.includes('127.0.0.1'))) {
          return url;
        }
      }
      if (config?.apiBaseUrl) {
        const url = config.apiBaseUrl;
        if (isLocalHost || (!url.includes('localhost') && !url.includes('127.0.0.1'))) {
          return `${url.replace(/\/$/, '')}${options.suffix}`;
        }
      }
      
      const defaultBase = getDefaultBackendUrl();
      return `${defaultBase.replace(/\/$/, '')}${options.suffix}`;
    }
    return `/api/v1${options.suffix}`;
  };

  const client = axios.create({
    baseURL: getBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((config) => {
    // Dynamically evaluate baseURL on every request to pick up runtime updates
    config.baseURL = getBaseUrl();

    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.headers) {
      config.headers['X-Tenant-Code'] = getWorkspaceFromUrl();
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  return client;
};

