import React, { useState } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useLogin } from '../../hooks/useAuth';
import { UniversalLoginProps, UserPersonaRole } from './UniversalLogin.types';
import { UniversalLoginDesktop } from './UniversalLogin.desktop';
import { UniversalLoginMobile } from './UniversalLogin.mobile';

export const UniversalLogin: React.FC<UniversalLoginProps> = ({
  role = 'staff',
  appName,
  title,
  subtitle,
  systemBadge,
  themeColor,
  gradient,
  logoUrl,
  features,
  loginEndpoint,
  onSuccess,
  redirectPath = '/',
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const {
    activeWorkspace,
    setActiveWorkspace,
    workspaceName,
    setWorkspaceName,
    resolveTenant,
    login,
    loading,
    error,
    setError,
  } = useLogin();

  const [activeRole, setActiveRole] = useState<UserPersonaRole>(role === 'universal' ? 'staff' : role);

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || activeWorkspace.toLowerCase() === 'business') {
      setError('Please select or scan your organization workspace first.');
      return;
    }

    try {
      const authResult = await login({
        email,
        password,
        workspaceCode: activeWorkspace,
        role: activeRole,
        loginEndpoint,
      });

      if (onSuccess) {
        onSuccess(authResult.rawResponse);
      } else {
        if (redirectPath.startsWith('#')) {
          window.location.hash = redirectPath;
        } else if (redirectPath === '/') {
          window.location.hash = '#/';
        } else {
          window.location.hash = `#${redirectPath}`;
        }
      }
    } catch (err: any) {
      // Handled and set inside useLogin
    }
  };

  const sharedProps = {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    error,
    activeRole,
    setActiveRole,
    activeWorkspace,
    workspaceName,
    onWorkspaceChange: handleSelectWorkspace,
    onSubmit: handleLoginSubmit,
    role,
    appName,
    title,
    subtitle,
    systemBadge,
    themeColor,
    gradient,
    logoUrl,
    features,
  };

  return isDesktop ? (
    <UniversalLoginDesktop {...sharedProps} />
  ) : (
    <UniversalLoginMobile {...sharedProps} />
  );
};
