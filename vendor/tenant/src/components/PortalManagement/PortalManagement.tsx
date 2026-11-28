import React from 'react';
import { useMediaQuery } from '@geeksman/core-ui';
import { usePortalManagementPage } from '../../hooks/usePortalManagementPage';
import { PortalManagementDesktop } from './PortalManagement.desktop';
import { PortalManagementMobile } from './PortalManagement.mobile';

export const PortalManagement: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const viewProps = usePortalManagementPage();

  return isDesktop ? (
    <PortalManagementDesktop {...viewProps} />
  ) : (
    <PortalManagementMobile {...viewProps} />
  );
};
