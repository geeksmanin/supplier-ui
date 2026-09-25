import React from 'react';
import { useIsMobile } from '@geeksman/core-ui';
import { MetaWhatsAppDesktop } from './MetaWhatsAppPage.desktop';
import { MetaWhatsAppMobile } from './MetaWhatsAppPage.mobile';

export const MetaWhatsAppPage: React.FC = () => {
  const isMobile = useIsMobile();

  return isMobile ? <MetaWhatsAppMobile /> : <MetaWhatsAppDesktop />;
};

export default MetaWhatsAppPage;
