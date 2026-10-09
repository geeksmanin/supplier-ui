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
    const isLanIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.endsWith('.local');

    const override = localStorage.getItem('portal_override_backend_url') === 'true';
    const savedUrl = localStorage.getItem('portal_backend_url');
    if (override && savedUrl) {
      return savedUrl.replace(/\/$/, '');
    }

    const config = window.runtimeConfig as any;
    if (config?.apiBaseUrl) {
      const url = config.apiBaseUrl;
      if (isLocalHost || isLanIp || (!url.includes('localhost') && !url.includes('127.0.0.1'))) {
        if (isLanIp && url.includes('localhost')) {
          return url.replace('localhost', host).replace(/\/$/, '');
        }
        return url.replace(/\/$/, '');
      }
    }

    if (isLanIp) {
      let localPort = '8082';
      try {
        const defaultUrl = getDefaultBackendUrl();
        if (defaultUrl) {
          const parsedUrl = new URL(defaultUrl);
          if (parsedUrl.port) {
            localPort = parsedUrl.port;
          }
        }
      } catch (e) {
        // ignore
      }
      return `http://${host}:${localPort}/api/v1`;
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
  if (typeof window !== 'undefined') {
    const appConfig = getAppConfig();

    // 1. Check URL query parameters (both standard query and hash query, e.g. ?workspace=synchx)
    const searchParams = new URLSearchParams(window.location.search);
    let queryWs = searchParams.get('workspace') || searchParams.get('tenant') || searchParams.get('tenant_code');

    if (!queryWs && window.location.hash.includes('?')) {
      const hashQuery = window.location.hash.split('?')[1];
      const hashParams = new URLSearchParams(hashQuery);
      queryWs = hashParams.get('workspace') || hashParams.get('tenant') || hashParams.get('tenant_code');
    }

    if (queryWs) {
      const ws = queryWs.trim().toLowerCase();
      localStorage.setItem('tenant_code', ws);
      localStorage.setItem('workspace_code', ws);
      return ws;
    }

    // 2. Check Hostname subdomain (e.g. synchx.geeksman.co.in) if URL resolution is enabled
    if (appConfig.resolveTenantFromUrl) {
      const host = window.location.hostname.toLowerCase();
      const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
      if (host && host !== 'localhost' && host !== '127.0.0.1' && !host.endsWith('.localhost') && !isIpAddress) {
        const parts = host.split('.');
        const appPrefixes = ['admin', 'platform', 'www', 'samwad', 'samvad', 'chat', 'staff', 'customer', 'portal', 'catalogue', 'catalog', 'app', 'api', 'business'];
        if (parts.length > 1) {
          // Explicit business gateway subdomain (e.g. business.samwad.geeksman.co.in or business.geeksman.in)
          if (parts[0] === 'business' || parts[1] === 'business') {
            const savedTenant = localStorage.getItem('tenant_code') || localStorage.getItem('workspace_code');
            if (savedTenant && savedTenant !== 'business') {
              return savedTenant;
            }
            return 'business';
          }
          if (!appPrefixes.includes(parts[0])) {
            return parts[0];
          } else if (parts.length > 2 && !appPrefixes.includes(parts[1])) {
            // E.g. samwad.a3pl.in -> parts[1] is 'a3pl'
            return parts[1];
          }
        }
      }
    }

    // 3. User-chosen or saved tenant in localStorage (survives reloads and explicit switches)
    const savedTenant = localStorage.getItem('tenant_code') || localStorage.getItem('workspace_code');
    if (savedTenant && savedTenant !== 'business') {
      return savedTenant;
    }

    // 4. Fallback to configured defaultTenant from AppConfig
    if (appConfig.defaultTenant && appConfig.defaultTenant !== 'business') {
      return appConfig.defaultTenant;
    }
  }
  const appConfig = getAppConfig();
  return appConfig.tenantCode || appConfig.defaultTenant || 'platform';
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

  // Resolve tenant code from current hostname subdomain or localStorage setting
  if (config.headers) {
    config.headers['X-Tenant-Code'] = getWorkspaceFromUrl();
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

