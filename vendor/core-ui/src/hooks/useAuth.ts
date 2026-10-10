import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, getWorkspaceFromUrl, resolveTenantByCode, TenantMetadata } from '../api/client';
import { getAppConfig } from '../config';
import { setAuthToken, setCurrentUser, clearCurrentUser, clearAuthToken } from '../utils/auth';

export type AuthRole = 'staff' | 'customer' | 'vendor' | 'universal';

export interface LoginParams {
  email: string;
  password: string;
  workspaceCode?: string;
  role?: AuthRole;
  loginEndpoint?: string;
  rememberMe?: boolean;
}

export interface LoginResult {
  token: string;
  userId: string;
  userEmail: string;
  userName: string;
  tenantCode: string;
  rawResponse: any;
}

export interface UseLoginReturn {
  activeWorkspace: string;
  setActiveWorkspace: (code: string) => void;
  workspaceName: string;
  setWorkspaceName: (name: string) => void;
  resolvedTenantMeta: TenantMetadata | null;
  isResolvingTenant: boolean;
  resolveTenant: (code: string) => Promise<TenantMetadata | null>;
  login: (params: LoginParams) => Promise<LoginResult>;
  loading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
}

/**
 * useLogin: Centralized hook handling multi-tenant credentials authentication,
 * backend tenant resolution, JWT decoding, user profile storage, and event broadcasting.
 */
export function useLogin(): UseLoginReturn {
  const [activeWorkspace, setActiveWorkspace] = useState<string>(() => {
    const config = getAppConfig();
    const fromStorage = typeof window !== 'undefined'
      ? (localStorage.getItem('tenant_code') || localStorage.getItem('workspace_code'))
      : null;
    if (fromStorage && fromStorage !== 'business') return fromStorage;
    const fromUrl = getWorkspaceFromUrl();
    if (fromUrl && fromUrl !== 'business') return fromUrl;
    if (config.defaultTenant && config.defaultTenant !== 'business') return config.defaultTenant;
    return '';
  });

  const [workspaceName, setWorkspaceName] = useState<string>(() => {
    return typeof window !== 'undefined' ? (localStorage.getItem('tenant_name') || '') : '';
  });

  const [resolvedTenantMeta, setResolvedTenantMeta] = useState<TenantMetadata | null>(null);
  const [isResolvingTenant, setIsResolvingTenant] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Resolves tenant metadata from the backend to verify existence and retrieve branding.
   */
  const resolveTenant = useCallback(async (code: string): Promise<TenantMetadata | null> => {
    const cleaned = code.trim().toLowerCase();
    if (!cleaned || cleaned === 'business') {
      setResolvedTenantMeta(null);
      return null;
    }

    setIsResolvingTenant(true);
    try {
      const meta = await resolveTenantByCode(cleaned);
      setResolvedTenantMeta(meta);
      setActiveWorkspace(meta.tenant_code);
      if (meta.name) {
        setWorkspaceName(meta.name);
        localStorage.setItem('tenant_name', meta.name);
      }
      return meta;
    } catch (err: any) {
      console.warn('Backend tenant resolution warning:', err);
      // Fallback in dev/local setups if platform resolve endpoint is unavailable
      const fallbackMeta: TenantMetadata = {
        tenant_code: cleaned,
        workspace: cleaned,
        name: cleaned.toUpperCase(),
        is_active: true,
      };
      setResolvedTenantMeta(fallbackMeta);
      setActiveWorkspace(cleaned);
      return fallbackMeta;
    } finally {
      setIsResolvingTenant(false);
    }
  }, []);

  /**
   * Performs authentication against the backend with tenant scoping.
   */
  const login = useCallback(async ({
    email,
    password,
    workspaceCode,
    role = 'staff',
    loginEndpoint,
  }: LoginParams): Promise<LoginResult> => {
    const targetWorkspace = (workspaceCode || activeWorkspace || '').trim().toLowerCase();
    if (!targetWorkspace || targetWorkspace === 'business') {
      const errMsg = 'Please select or scan your organization workspace first.';
      setError(errMsg);
      throw new Error(errMsg);
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = loginEndpoint || (role === 'customer' || role === 'vendor'
        ? '/contacts/customer/login'
        : '/tenant/users/login');

      const payload: Record<string, any> = { email, password };
      if (role === 'staff') {
        payload.tenant_code = targetWorkspace;
      }

      const headers: Record<string, string> = {
        'X-Tenant-Code': targetWorkspace,
      };

      const res = await apiClient.post(endpoint, payload, { headers });

      const responseData = res.data?.data || res.data;
      const token = responseData?.access_token || responseData?.token;
      if (!token) {
        throw new Error('Authentication token not received from server.');
      }

      // Safe decode of JWT claims
      let decoded: any = {};
      try {
        const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        decoded = JSON.parse(decodeURIComponent(escape(atob(payloadBase64))));
      } catch (e) {
        // payload decode fallback
      }

      // Role isolation: prevent customers from logging into staff
      const roles = decoded.roles || decoded.role || [];
      const roleList = Array.isArray(roles) ? roles : [roles];
      const isCustomer = roleList.some((r: string) => r.toUpperCase() === 'CUSTOMER');
      if (role === 'staff' && isCustomer) {
        throw new Error('Access denied: Customer accounts cannot sign in to Staff Operations.');
      }

      const userId = responseData.user_id || responseData.customer_id || decoded.user_id || decoded.id || '';
      const userName = responseData.name || decoded.user_alias || decoded.name || '';
      const userEmail = responseData.email || decoded.user_email || email;
      const tokenTenant = decoded.tenant_alias || decoded.tenant_code || decoded.tenant || decoded.workspace_code || decoded.workspace;
      const tenantCode = (responseData.tenant_code && responseData.tenant_code !== 'business')
        ? responseData.tenant_code
        : (tokenTenant && tokenTenant !== 'business')
        ? tokenTenant
        : (targetWorkspace && targetWorkspace !== 'business')
        ? targetWorkspace
        : '';

      // Persist auth and user context directly to localStorage
      setAuthToken(token);
      if (tenantCode && tenantCode !== 'business') {
        localStorage.setItem('tenant_code', tenantCode);
        localStorage.setItem('workspace_code', tenantCode);
        localStorage.setItem('current_tenant_code', tenantCode);
      }

      setCurrentUser({
        userId,
        userName,
        userEmail,
        tenantCode,
      });

      // Broadcast login event across tabs and listeners
      localStorage.setItem('app_login_event', Date.now().toString());
      window.dispatchEvent(new Event('app_login_event'));
      window.dispatchEvent(new StorageEvent('storage', { key: 'app_login_event' }));

      return {
        token,
        userId,
        userEmail,
        userName,
        tenantCode,
        rawResponse: responseData,
      };
    } catch (err: any) {
      console.error('Login failed:', err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Invalid credentials or authentication failure.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace]);

  return {
    activeWorkspace,
    setActiveWorkspace,
    workspaceName,
    setWorkspaceName,
    resolvedTenantMeta,
    isResolvingTenant,
    resolveTenant,
    login,
    loading,
    error,
    setError,
  };
}

export interface LogoutOptions {
  /** If true, removes cached tenant workspace and resets to generic "business" state */
  clearWorkspace?: boolean;
  /** Custom destination redirect path (defaults to '/login') */
  redirectUrl?: string;
}

export interface UseLogoutReturn {
  logout: (options?: LogoutOptions) => void;
  isLoggingOut: boolean;
}

/**
 * useLogout: Centralized hook handling clean session teardown,
 * clearing tokens, user identity, active branch, and triggering unregister events.
 */
export function useLogout(): UseLogoutReturn {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  let navigate: any = null;
  try {
    navigate = useNavigate();
  } catch (e) {
    // Router context not available
  }

  const logout = useCallback((options?: LogoutOptions) => {
    setIsLoggingOut(true);
    try {
      // 1. Clear session tokens and user identity
      clearAuthToken();
      clearCurrentUser();

      // 2. Clear branch context
      localStorage.removeItem('active_branch');

      // 3. Clear workspace only if explicitly requested
      if (options?.clearWorkspace) {
        localStorage.removeItem('tenant_code');
        localStorage.removeItem('workspace_code');
        localStorage.removeItem('current_tenant_code');
        localStorage.removeItem('tenant_name');
        localStorage.removeItem('tenant_logo_url');
        localStorage.removeItem('tenant_theme_color');
      }

      // 4. Broadcast logout event to unregister push notifications and reset state
      localStorage.setItem('app_logout_event', Date.now().toString());
      window.dispatchEvent(new Event('app_logout_event'));
      window.dispatchEvent(new StorageEvent('storage', { key: 'app_logout_event' }));

      // 5. Navigate to login
      const target = options?.redirectUrl || '/login';
      if (navigate) {
        navigate(target);
      } else {
        if (target.startsWith('#')) {
          window.location.hash = target;
        } else if (target.startsWith('/')) {
          window.location.hash = `#${target}`;
        } else {
          window.location.href = target;
        }
      }
    } finally {
      setIsLoggingOut(false);
    }
  }, [navigate]);

  return {
    logout,
    isLoggingOut,
  };
}
