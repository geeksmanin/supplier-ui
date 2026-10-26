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
  backgroundColor,
  gradient,
  logoUrl,
  workspaceLogo,
  layout = 'loader',
  loaderTheme,
  features,
  loginEndpoint,
  workspaceCode,
  onLogin,
  onSuccess,
  redirectPath = '/',
  onWorkspaceChange: onWorkspaceChangeProp,
  onOpenWorkspaceModal,
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const {
    activeWorkspace,
    setActiveWorkspace,
    workspaceName,
    setWorkspaceName,
    resolveTenant,
    login,
    loading: defaultLoading,
    error: defaultError,
    setError,
  } = useLogin();

  // If workspaceCode is provided as prop and differs, initialize it
  React.useEffect(() => {
    if (workspaceCode && workspaceCode !== activeWorkspace) {
      setActiveWorkspace(workspaceCode);
      resolveTenant(workspaceCode);
    }
  }, [workspaceCode]);

  // Automatically resolve tenant branding/metadata if activeWorkspace is resolved
  React.useEffect(() => {
    if (activeWorkspace && activeWorkspace.toLowerCase() !== 'business' && !workspaceName) {
      resolveTenant(activeWorkspace);
    }
  }, [activeWorkspace, workspaceName]);

  const [activeRole, setActiveRole] = useState<UserPersonaRole>(role === 'universal' ? 'staff' : role);
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const loading = onLogin ? customLoading : defaultLoading;
  const error = onLogin ? customError : defaultError;

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
    setCustomError(null);
    if (onWorkspaceChangeProp) {
      onWorkspaceChangeProp(code, meta);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || activeWorkspace.toLowerCase() === 'business') {
      const err = 'Please select or scan your organization workspace first.';
      if (onLogin) setCustomError(err);
      else setError(err);
      return;
    }

    try {
      let authPayload: any;
      if (onLogin) {
        setCustomLoading(true);
        setCustomError(null);
        authPayload = await onLogin({
          email,
          password,
          workspaceCode: activeWorkspace,
          role: activeRole,
        });
      } else {
        const authResult = await login({
          email,
          password,
          workspaceCode: activeWorkspace,
          role: activeRole,
          loginEndpoint,
        });
        authPayload = authResult.rawResponse;
      }

      if (onSuccess) {
        onSuccess(authPayload);
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
      if (onLogin) {
        setCustomError(err.message || 'Authentication failed');
      }
    } finally {
      if (onLogin) setCustomLoading(false);
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
    onOpenWorkspaceModal,
    onSubmit: handleLoginSubmit,
    role,
    appName,
    title,
    subtitle,
    systemBadge,
    themeColor,
    backgroundColor,
    gradient,
    logoUrl,
    workspaceLogo,
    layout,
    loaderTheme,
    features,
  };

  return isDesktop ? (
    <UniversalLoginDesktop {...sharedProps} />
  ) : (
    <UniversalLoginMobile {...sharedProps} />
  );
};
