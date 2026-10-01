import React from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { AppUpdateBannerProps } from './types';
import { AppUpdateBannerDesktop } from './AppUpdateBanner.desktop';
import { AppUpdateBannerMobile } from './AppUpdateBanner.mobile';

export const AppUpdateBanner: React.FC<AppUpdateBannerProps> = (props) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return <AppUpdateBannerDesktop {...props} />;
  }

  return <AppUpdateBannerMobile {...props} />;
};

export { AppUpdateBannerDesktop, AppUpdateBannerMobile };
