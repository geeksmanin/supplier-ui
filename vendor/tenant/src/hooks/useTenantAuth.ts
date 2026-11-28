import { useState, useCallback } from 'react';
import { useLogin, useLogout, LoginResult, clearCurrentUser, clearAuthToken } from '@geeksman/core-ui';

export interface TenantLoginPayload {
  email: string;
  password: string;
  workspaceCode?: string;
}

function emitEvent(eventName: string, detail?: any) {
  if (typeof window === 'undefined') return;
  const eventTime = Date.now().toString();
  localStorage.setItem(eventName, eventTime);
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
  window.dispatchEvent(new StorageEvent('storage', { key: eventName }));
}

/**
 * useTenantAuth: Canonical hook for staff & tenant authentication.
 * Wraps core login logic with tenant/staff-specific scoping, role validation,
 * and emits both app_login_event and tenant_login_event.
 */
export function useTenantAuth() {
  const loginHook = useLogin();
  const logoutHook = useLogout();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginStaff = useCallback(
    async (payload: TenantLoginPayload): Promise<LoginResult> => {
      setLoading(true);
      setError(null);
      try {
        const result = await loginHook.login({
          email: payload.email,
          password: payload.password,
          workspaceCode: payload.workspaceCode || loginHook.activeWorkspace,
          role: 'staff',
          loginEndpoint: '/tenant/users/login',
        });

        // Emit dedicated tenant/staff event
        emitEvent('tenant_login_event', {
          tenantCode: result.tenantCode,
          userId: result.userId,
        });

        return result;
      } catch (err: any) {
        const msg = err.message || 'Staff authentication failed';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loginHook]
  );

  const logoutStaff = useCallback(() => {
    logoutHook.logout({
      redirectUrl: '#/login',
      clearWorkspace: false,
    });
    emitEvent('app_logout_event', { role: 'staff' });
    emitEvent('tenant_logout_event');
  }, [logoutHook]);

  return {
    ...loginHook,
    loading: loading || loginHook.loading,
    error: error || loginHook.error,
    setError,
    loginStaff,
    logoutStaff,
    loginTenant: loginStaff,
    logoutTenant: logoutStaff,
  };
}

/**
 * Global helper to log out staff and emit tenant_logout_event
 */
export function logoutTenant(): void {
  if (typeof window === 'undefined') return;
  clearAuthToken();
  clearCurrentUser();
  emitEvent('app_logout_event', { role: 'staff' });
  emitEvent('tenant_logout_event');
}

export const logoutStaff = logoutTenant;
