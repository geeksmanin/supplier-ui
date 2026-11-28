import React, { useState } from 'react';
import { useMediaQuery } from '@geeksman/core-ui';
import { useTenantAuth } from '../../hooks/useTenantAuth';
import { LoginDesktop } from './Login.desktop';
import { LoginMobile } from './Login.mobile';

export { LoginDesktop } from './Login.desktop';
export { LoginMobile } from './Login.mobile';

export const Login: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 900px)');
  const {
    activeWorkspace,
    setActiveWorkspace,
    workspaceName,
    setWorkspaceName,
    resolvedTenantMeta,
    resolveTenant,
    loginStaff,
    loading,
    error,
    setError,
  } = useTenantAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSelectWorkspace = async (code: string, meta?: any) => {
    setActiveWorkspace(code);
    if (meta?.name) {
      setWorkspaceName(meta.name);
    } else {
      await resolveTenant(code);
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || activeWorkspace.toLowerCase() === 'business') {
      setError('Please click the workspace badge above to enter or scan your workspace code.');
      return;
    }

    try {
      await loginStaff({
        email,
        password,
        workspaceCode: activeWorkspace,
      });
      window.location.hash = '#/dashboard';
    } catch (err: any) {
      // Error handled and set in useTenantAuth
    }
  };

  const commonProps = {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    error,
    activeWorkspace,
    workspaceName,
    workspaceLogo: resolvedTenantMeta?.logo_url || (typeof window !== 'undefined' ? localStorage.getItem('tenant_logo_url') || undefined : undefined),
    onWorkspaceChange: handleSelectWorkspace,
    onSubmit: handleSubmit,
  };

  return isDesktop ? (
    <LoginDesktop {...commonProps} />
  ) : (
    <LoginMobile {...commonProps} />
  );
};
