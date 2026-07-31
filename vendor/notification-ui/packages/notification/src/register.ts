import React from 'react';
import { UIRegistry } from '@geeksman/core-ui';
import { WhatsAppIntegrationPage } from './components/WhatsAppIntegrationPage';

export function registerNotificationModule() {
  // Register WhatsApp Integration route
  UIRegistry.registerRoute({
    path: '/settings/integrations/whatsapp',
    element: React.createElement(WhatsAppIntegrationPage),
    isProtected: true,
  });

  // Register in Settings Subnavigation Menu under Extended section
  UIRegistry.registerNavItem({
    id: 'settings-whatsapp-integration',
    label: 'WhatsApp Integration',
    path: '/settings/integrations/whatsapp',
    icon: '💬',
    section: 'extended',
    parentId: 'settings',
  });
}
