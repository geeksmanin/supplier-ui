import React from 'react';
import { UIRegistry } from '@geeksman/core-ui';
import { WhatsAppIntegrationPage } from './components/WhatsAppIntegrationPage';
import { NotificationObservabilityPage } from './components/NotificationObservabilityPage';
import { IntegrationsIcon } from './components/IntegrationsIcon';

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

  // 3. Register WhatsApp Integration sub-route (/integrations/whatsapp)
  UIRegistry.registerRoute({
    path: '/integrations/whatsapp',
    element: React.createElement(WhatsAppIntegrationPage),
    isProtected: true,
  });

  // 4. Register WhatsApp Integration sub-nav item under Integrations parent
  UIRegistry.registerNavItem({
    id: 'integrations-whatsapp',
    label: 'WhatsApp Integration',
    path: '/integrations/whatsapp',
    icon: '💬',
    section: 'extended',
    parentId: 'integrations-hub',
  });

  // 5. Legacy route alias for settings menu compatibility (/settings/integrations/whatsapp)
  UIRegistry.registerRoute({
    path: '/settings/integrations/whatsapp',
    element: React.createElement(WhatsAppIntegrationPage),
    isProtected: true,
  });

  // 6. Register Notification Observability sub-route (/integrations/notifications)
  UIRegistry.registerRoute({
    path: '/integrations/notifications',
    element: React.createElement(NotificationObservabilityPage),
    isProtected: true,
  });

  // 7. Register Notification Observability sub-nav item under Integrations parent
  UIRegistry.registerNavItem({
    id: 'integrations-notifications',
    label: 'Notification & Devices',
    path: '/integrations/notifications',
    icon: '🔔',
    section: 'extended',
    parentId: 'integrations-hub',
  });

  // 8. Register Global Search Item (Ctrl+K)
  UIRegistry.registerSearchItem({
    id: 'integrations-notifications-search',
    title: 'Notification & Live Devices',
    description: 'Monitor active SSE streams, FCM device tokens, WebPush, and dispatch test notifications',
    category: 'Integrations',
    keywords: ['notifications', 'devices', 'fcm', 'push', 'sse', 'live stream', 'integrations', 'mobile'],
    action: (navigate: (path: string) => void) => navigate('/integrations/notifications'),
  });

  // 9. Legacy settings route alias
  UIRegistry.registerRoute({
    path: '/settings/integrations/notifications',
    element: React.createElement(NotificationObservabilityPage),
    isProtected: true,
  });
}
