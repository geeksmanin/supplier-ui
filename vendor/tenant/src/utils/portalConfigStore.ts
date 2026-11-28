import { getAppConfig } from '@geeksman/core-ui';

export interface PortalSummaryConfig {
  portal_code: string;
  display_name: string;
  is_enabled: boolean;
  landing_mode: string;
  default_route: string;
  default_agent_id?: string;
  visible_agents: string[];
  app_name?: string;
  logo_url?: string;
  favicon_url?: string;
  theme_color?: string;
  settings: Record<string, any>;
  updated_at?: string;
}

export const PORTAL_CONFIG_STORAGE_PREFIX = 'portal_configs_';
export const PORTAL_CONFIG_UPDATED_EVENT = 'tenant_portal_config_updated';

export const getStoredPortalConfigs = (
  tenantCode?: string
): Record<string, PortalSummaryConfig> => {
  if (typeof window === 'undefined') return {};
  const tc =
    tenantCode ||
    localStorage.getItem('tenant_code') ||
    getAppConfig().tenantCode ||
    'platform';
  try {
    const raw = localStorage.getItem(`${PORTAL_CONFIG_STORAGE_PREFIX}${tc}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const persistPortalConfigs = (
  tenantCode: string,
  portals?: Record<string, PortalSummaryConfig>
): void => {
  if (typeof window === 'undefined' || !tenantCode || !portals) return;
  try {
    const key = `${PORTAL_CONFIG_STORAGE_PREFIX}${tenantCode}`;
    localStorage.setItem(key, JSON.stringify(portals));
    window.dispatchEvent(
      new CustomEvent(PORTAL_CONFIG_UPDATED_EVENT, {
        detail: { tenant_code: tenantCode, portals },
      })
    );
  } catch {
    // ignore storage quota errors
  }
};
