import React from 'react';
import { UIRegistry } from '@geeksman/core-ui';
import { WhatsAppIntegrationPage } from './components/WhatsAppIntegrationPage';
import { NotificationObservabilityPage } from './components/NotificationObservabilityPage';
import { IntegrationsIcon } from './components/IntegrationsIcon';
import { MetaWhatsAppPage } from './components/metaWhatsapp';

import { WhatsApp3DIcon } from './components/WhatsApp3DIcon';

export function registerNotificationModule() {
  // 1. Register Integrations Parent Route (/integrations) so clicking main menu works instantly
  UIRegistry.registerRoute({
    path: '/integrations',
    element: React.createElement(WhatsAppIntegrationPage),
    isProtected: true,
  });

  // 2. Register Integrations Category Nav Item with 3D IntegrationsIcon in main sidebar
  UIRegistry.registerNavItem({
    id: 'integrations-hub',
    label: 'Integrations',
    path: '/integrations',
    icon: React.createElement(IntegrationsIcon),
    section: 'main',
    bgGradient: 'transparent',
    sublabel: 'Connected Services',
  });

  // 3. Register WhatsApp (Unofficial / QR Connect) sub-route (/integrations/whatsapp)
  UIRegistry.registerRoute({
    path: '/integrations/whatsapp',
    element: React.createElement(WhatsAppIntegrationPage),
    isProtected: true,
  });

  // 4. Register WhatsApp (Unofficial / QR Connect) sub-nav item under Integrations parent
  UIRegistry.registerNavItem({
    id: 'integrations-whatsapp',
    label: 'WhatsApp (Unofficial / QR Connect)',
    path: '/integrations/whatsapp',
    icon: '💬',
    section: 'extended',
    parentId: 'integrations-hub',
  });

  // 5. Register Meta WhatsApp Business Cloud API sub-route (/integrations/meta-whatsapp)
  UIRegistry.registerRoute({
    path: '/integrations/meta-whatsapp',
    element: React.createElement(MetaWhatsAppPage),
    isProtected: true,
  });

  // 6. Register Meta WhatsApp Business sub-nav item under Integrations parent
  UIRegistry.registerNavItem({
    id: 'integrations-meta-whatsapp',
    label: 'Meta WhatsApp Business',
    path: '/integrations/meta-whatsapp',
    icon: React.createElement(WhatsApp3DIcon, { size: 18 }),
    section: 'extended',
    parentId: 'integrations-hub',
  });

  // 7. Legacy route alias for settings menu compatibility (/settings/integrations/whatsapp)
  UIRegistry.registerRoute({
    path: '/settings/integrations/whatsapp',
    element: React.createElement(WhatsAppIntegrationPage),
    isProtected: true,
  });

  // 8. Register Notification Observability sub-route (/integrations/notifications)
  UIRegistry.registerRoute({
    path: '/integrations/notifications',
    element: React.createElement(NotificationObservabilityPage),
    isProtected: true,
  });

  // 9. Register Notification Observability sub-nav item under Integrations parent
  UIRegistry.registerNavItem({
    id: 'integrations-notifications',
    label: 'Notification & Devices',
    path: '/integrations/notifications',
    icon: '🔔',
    section: 'extended',
    parentId: 'integrations-hub',
  });

  // 10. Register Global Search Items (Ctrl+K)
  UIRegistry.registerSearchItem({
    id: 'integrations-notifications-search',
    title: 'Notification & Live Devices',
    description: 'Monitor active SSE streams, FCM device tokens, WebPush, and dispatch test notifications',
    category: 'Integrations',
    keywords: ['notifications', 'devices', 'fcm', 'push', 'sse', 'live stream', 'integrations', 'mobile'],
    action: (navigate: (path: string) => void) => navigate('/integrations/notifications'),
  });

  UIRegistry.registerSearchItem({
    id: 'meta-whatsapp-integrations-search',
    title: 'Meta Official WhatsApp Business Settings',
    description: 'Manage WhatsApp accounts, message templates, webhooks and delivery logs',
    category: 'Integrations',
    keywords: ['whatsapp', 'meta', 'waba', 'chat', 'messages', 'integration', 'hsm', 'template', 'cloud api'],
    action: (navigate: (path: string) => void) => navigate('/integrations/meta-whatsapp'),
  });

  // 11. Legacy settings route alias
  UIRegistry.registerRoute({
    path: '/settings/integrations/notifications',
    element: React.createElement(NotificationObservabilityPage),
    isProtected: true,
  });
}

