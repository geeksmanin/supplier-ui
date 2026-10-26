import axios from 'axios';
import { getAppConfig } from '../config';
import { isNativePlatform } from '../native/platform';
import { getCurrentUser } from '../utils/auth';

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
    const config = getAppConfig();
    if (config.apiBaseUrl) {
      return config.apiBaseUrl.replace(/\/$/, '');
    }

    const legacyConfig = (window as any).runtimeConfig;
    if (legacyConfig?.apiBaseUrl) {
      return legacyConfig.apiBaseUrl.replace(/\/$/, '');
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

export interface TenantMetadata {
  tenant_code: string;
  workspace: string;
  name?: string;
  logo_url?: string;
  theme_color?: string;
  staff_app_name?: string;
  staff_logo_url?: string;
  customer_app_name?: string;
  customer_logo_url?: string;
  is_active: boolean;
}

export const getWorkspaceFromUrl = (): string => {
  const appConfig = getAppConfig();
  if (appConfig.tenantCode && appConfig.tenantCode !== 'business') {
    return appConfig.tenantCode;
  }
  if (typeof window !== 'undefined') {
    try {
      const user = getCurrentUser();
      if (user?.tenantCode && user.tenantCode !== 'business') {
        return user.tenantCode;
      }
    } catch {}
  }
  const def = appConfig.tenantCode || appConfig.defaultTenant;
  if (def && def !== 'business') return def;
  return '';
};

export const resolveTenantByCode = async (workspaceCode: string): Promise<TenantMetadata> => {
  const code = workspaceCode.trim();
  if (!code) throw new Error('Workspace code is required');

  const response = await axios.get(`${getBaseUrl()}/tenant/resolve`, {
    params: { code },
    headers: { 'X-Tenant-Code': 'platform' },
  });

  const data = response.data?.data as TenantMetadata;
  if (!data || !data.tenant_code) {
    throw new Error('Workspace not found');
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('tenant_code', data.tenant_code);
    localStorage.setItem('workspace_code', data.workspace || code);
    if (data.name) localStorage.setItem('tenant_name', data.name);
    if (data.logo_url) localStorage.setItem('tenant_logo_url', data.logo_url);
    if (data.theme_color) localStorage.setItem('tenant_theme_color', data.theme_color);
  }

  const config = getAppConfig();
  config.tenantCode = data.tenant_code;
  return data;
};

export const clearActiveWorkspace = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tenant_code');
    localStorage.removeItem('workspace_code');
    localStorage.removeItem('current_tenant_code');
    localStorage.removeItem('tenant_name');
    localStorage.removeItem('tenant_logo_url');
    localStorage.removeItem('tenant_theme_color');
  }
  const config = getAppConfig();
  config.tenantCode = config.defaultTenant || 'platform';
};

export const resolveTenantCodeFromServer = async (): Promise<string> => {
  if (typeof window === 'undefined') return 'platform';

  const config = getAppConfig();

  // 1. If resolveTenantFromUrl is enabled, prioritize backend host resolution (GET /tenant/resolve?host=...)
  if (config.resolveTenantFromUrl) {
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
        localStorage.setItem('tenant_code', tenantCode);
        localStorage.setItem('workspace_code', tenantCode);
        if (response.data?.data?.name) localStorage.setItem('tenant_name', response.data.data.name);
        return tenantCode;
      }
    } catch (err) {
      console.warn('Failed to resolve tenant from backend, falling back to stored/default:', err);
    }
  }

  // 2. Saved tenant in localStorage (fallback if URL resolution is disabled or returned no code)
  const savedTenant = localStorage.getItem('tenant_code');
  if (savedTenant) {
    config.tenantCode = savedTenant;
    return savedTenant;
  }

  // 3. Fallback to default tenant or 'platform'
  const fallbackTenant = config.defaultTenant || 'platform';
  config.tenantCode = fallbackTenant;
  localStorage.setItem('tenant_code', fallbackTenant);
  localStorage.setItem('workspace_code', fallbackTenant);
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

  // Resolve tenant code from authenticated user context, hostname subdomain, or localStorage setting
  if (config.headers) {
    const user = getCurrentUser();
    let tenant = (user?.tenantCode && user.tenantCode !== 'business')
      ? user.tenantCode
      : getWorkspaceFromUrl();
    if (tenant && tenant !== 'business') {
      config.headers['X-Tenant-Code'] = tenant;
    }
    const activeBranch = localStorage.getItem('active_branch');
    if (activeBranch) {
      config.headers['X-Business-Code'] = activeBranch;
    }
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
      const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '10.0.2.2' || host.includes('dev.');
      const isLanIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.endsWith('.local');

      const override = localStorage.getItem('portal_override_backend_url') === 'true';
      const savedUrl = localStorage.getItem('portal_backend_url');
      if (override && savedUrl) {
        return `${savedUrl.replace(/\/$/, '')}${options.suffix}`;
      }

      const config = window.runtimeConfig as any;
      if (options.runtimeConfigKey && config?.[options.runtimeConfigKey]) {
        const url = config[options.runtimeConfigKey];
        if (isLocalHost || isLanIp || (!url.includes('localhost') && !url.includes('127.0.0.1') && !url.includes('10.0.2.2'))) {
          if (isLanIp && url.includes('localhost')) {
            return `${url.replace('localhost', host).replace(/\/$/, '')}${options.suffix}`;
          }
          return url;
        }
      }
      if (config?.apiBaseUrl) {
        const url = config.apiBaseUrl;
        if (isLocalHost || isLanIp || (!url.includes('localhost') && !url.includes('127.0.0.1') && !url.includes('10.0.2.2'))) {
          if (isLanIp && url.includes('localhost')) {
            return `${url.replace('localhost', host).replace(/\/$/, '')}${options.suffix}`;
          }
          return `${url.replace(/\/$/, '')}${options.suffix}`;
        }
      }

      if (isLanIp || isLocalHost) {
        const defaultBase = getDefaultBackendUrl();
        if (defaultBase) {
          if (isLanIp && (defaultBase.includes('localhost') || defaultBase.includes('127.0.0.1') || defaultBase.includes('10.0.2.2'))) {
            return `${defaultBase.replace(/localhost|127\.0\.0\.1|10\.0\.2\.2/, host).replace(/\/$/, '')}${options.suffix}`;
          }
          return `${defaultBase.replace(/\/$/, '')}${options.suffix}`;
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
      const user = getCurrentUser();
      let tenant = (user?.tenantCode && user.tenantCode !== 'business')
        ? user.tenantCode
        : getWorkspaceFromUrl();
      if (tenant && tenant !== 'business') {
        config.headers['X-Tenant-Code'] = tenant;
      }
      const activeBranch = localStorage.getItem('active_branch');
      if (activeBranch) {
        config.headers['X-Business-Code'] = activeBranch;
      }
      const assignBusiness = localStorage.getItem('allowed_branches');
      if (assignBusiness) {
        config.headers['X-Assign-Business'] = assignBusiness;
      }
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  return client;
};

