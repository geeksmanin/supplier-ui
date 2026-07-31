import React, { useState, useEffect } from 'react';
import { WhatsAppIntegrationPageDesktop } from './WhatsAppIntegrationPage.desktop';
import { WhatsAppIntegrationPageMobile } from './WhatsAppIntegrationPage.mobile';

export const WhatsAppIntegrationPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <WhatsAppIntegrationPageMobile /> : <WhatsAppIntegrationPageDesktop />;
};
