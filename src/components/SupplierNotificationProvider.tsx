import React, { useMemo } from 'react';
import { getAuthToken, getCurrentUser } from '@geeksman/core-ui';
import { NotificationProvider, NotificationToastContainer } from '@geeksman/notification';
import { useAppConfig } from '../config';

export const SupplierNotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { apiBaseUrl, config, tenantCode } = useAppConfig();

  const auth = useMemo(() => {
    const token = getAuthToken() || '';
    const user = getCurrentUser();
    return {
      token,
      userId: user?.userId || '',
      tenantCode: user?.tenantCode || tenantCode || 'platform',
    };
  }, [tenantCode]);

  const rawNotifBase = (config as any)?.notificationApiBaseUrl as string | undefined;
  const baseUrl = rawNotifBase
    ? `${rawNotifBase.replace(/\/$/, '')}/api/v1`
    : apiBaseUrl;

  if (!auth.token || !auth.userId) {
    return <>{children}</>;
  }

  return (
    <NotificationProvider
      baseUrl={baseUrl}
      userId={auth.userId}
      tenantCode={auth.tenantCode}
      token={auth.token}
    >
      <NotificationToastContainer />
      {children}
    </NotificationProvider>
  );
};
