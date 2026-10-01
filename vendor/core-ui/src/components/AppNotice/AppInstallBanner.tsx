import React from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { AppInstallBannerProps } from './types';
import { AppInstallBannerDesktop } from './AppInstallBanner.desktop';
import { AppInstallBannerMobile } from './AppInstallBanner.mobile';

export const AppInstallBanner: React.FC<AppInstallBannerProps> = (props) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return <AppInstallBannerDesktop {...props} />;
  }

  return <AppInstallBannerMobile {...props} />;
};

export { AppInstallBannerDesktop, AppInstallBannerMobile };
