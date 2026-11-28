import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  apiClient,
  broadcastEvent,
  getAppConfig,
  subscribeBroadcast,
  useNotificationConsumer,
  useRefreshOnVisible,
} from '@geeksman/core-ui';
import {
  getStoredPortalConfigs,
  persistPortalConfigs,
  PORTAL_CONFIG_STORAGE_PREFIX,
  PORTAL_CONFIG_UPDATED_EVENT,
} from '../utils/portalConfigStore';
import type { PortalSummaryConfig } from '../utils/portalConfigStore';
import type { PortalCode, PortalLandingMode } from '../types/portal';

const FALLBACK_ROUTES: Record<string, string> = {
  customer: '/home',
  samwad: '/',
  supplier: '/dashboard',
  supplier_marketplace: '/catalog',
};

const CUSTOMER_AGENT_ROUTE_MAP: Record<string, string> = {
  'agent-ticket': '/agent/ticket',
  'agent-sales': '/agent/sales',
  'agent-accounting': '/agent/accounting',
  'agent-subscription': '/agent/subscription',
  'agent-catalog': '/catalog',
};

const isSafeInternalRoute = (route?: string | null): boolean => {
  if (!route) return false;
  const trimmed = route.trim();
  return trimmed.startsWith('/') && !trimmed.startsWith('//');
};

export const resolvePortalLandingPath = (
  config?: Partial<PortalSummaryConfig> | null,
  portalCode: PortalCode = 'customer'
): string => {
  const code = String(portalCode || 'customer').toLowerCase();
  const fallback = FALLBACK_ROUTES[code] || '/';

  if (!config) return fallback;

  if (config.landing_mode === 'AGENT' && config.default_agent_id) {
    if (isSafeInternalRoute(config.default_route)) {
      return config.default_route as string;
    }
    if (code === 'customer' && CUSTOMER_AGENT_ROUTE_MAP[config.default_agent_id]) {
      return CUSTOMER_AGENT_ROUTE_MAP[config.default_agent_id];
    }
  }

  if (isSafeInternalRoute(config.default_route)) {
    return config.default_route as string;
  }

  return fallback;
};

/**
 * Single authoritative frontend fetcher for GET /tenant/resolve so all tenant branding
 * and portal hooks share one endpoint definition.
 */
export const fetchTenantResolution = async (params: Record<string, string>): Promise<any> => {
  const res = await apiClient.get('/tenant/resolve', { params });
  const info = res.data?.data;
  if (info?.tenant_code && info?.portals) {
    persistPortalConfigs(info.tenant_code, info.portals);
  }
  return info;
};

const getActiveTenantCode = (overrideTenantCode?: string): string => {
  if (overrideTenantCode) return overrideTenantCode;
  if (typeof window !== 'undefined') {
    const stored =
      localStorage.getItem('tenant_code') ||
      localStorage.getItem('workspace_code');
    if (stored) return stored;
  }
  return getAppConfig().tenantCode || getAppConfig().defaultTenant || 'platform';
};

const applyPortalLiveBranding = (
  portalCode: string,
  portal?: Partial<PortalSummaryConfig> | null
) => {
  if (typeof window === 'undefined' || !portal) return;
  const appName = portal.app_name || portal.display_name;
  if (appName && portalCode) {
    if (document.title !== appName) {
      document.title = appName;
    }
    localStorage.setItem('branding_name', appName);
  }
  if (portal.logo_url) {
    localStorage.setItem('branding_logo', portal.logo_url);
  }
  if (portal.favicon_url) {
    const faviconLink: any =
      document.querySelector('link[rel="icon"]') ||
      document.querySelector('link[rel="shortcut icon"]');
    if (faviconLink) {
      faviconLink.href = portal.favicon_url;
    }
  }
  if (portal.theme_color) {
    localStorage.setItem('tenant_theme_color', portal.theme_color);
  }
  window.dispatchEvent(
    new CustomEvent('tenant_branding_updated', {
      detail: {
        appName: appName || localStorage.getItem('branding_name') || '',
        logoUrl: portal.logo_url || localStorage.getItem('branding_logo') || '',
        faviconUrl: portal.favicon_url || '/favicon.png',
      },
    })
  );
};

const extractPortalUpdateFromPayload = (
  payload: any
): { tenant_code?: string; portal_code: string; config: PortalSummaryConfig } | null => {
  if (!payload) return null;
  let meta = payload.metadata ?? payload;
  if (typeof meta === 'string') {
    try {
      meta = JSON.parse(meta);
    } catch {
      return null;
    }
  }
  if (!meta || typeof meta !== 'object') return null;

  const isPortalEvent =
    meta.event_type === 'portal_config_updated' ||
    meta.type === 'portal_config_updated' ||
    (meta.module === 'tenant' && !!meta.portal_code && !!meta.config);

  if (!isPortalEvent || !meta.portal_code || !meta.config) return null;
  return {
    tenant_code: payload.tenant_code || meta.tenant_code || meta.config?.tenant_code,
    portal_code: String(meta.portal_code).toLowerCase(),
    config: meta.config as PortalSummaryConfig,
  };
};

interface PortalSettingsContextValue {
  tenantCode: string;
  activePortalCode?: string;
  portals: Record<string, PortalSummaryConfig>;
  loading: boolean;
  lastSyncedAt: string | null;
  refreshPortalSettings: (overrideTenant?: string) => Promise<Record<string, PortalSummaryConfig>>;
}

const PortalSettingsContext = createContext<PortalSettingsContextValue | null>(null);

export interface PortalSettingsProviderProps {
  portalCode?: PortalCode;
  tenantCode?: string;
  children: React.ReactNode;
}

export const PortalSettingsProvider: React.FC<PortalSettingsProviderProps> = ({
  portalCode,
  tenantCode: propTenantCode,
  children,
}) => {
  const [tenantCode, setTenantCode] = useState<string>(() => getActiveTenantCode(propTenantCode));
  const [portals, setPortals] = useState<Record<string, PortalSummaryConfig>>(() =>
    getStoredPortalConfigs(getActiveTenantCode(propTenantCode))
  );
  const [loading, setLoading] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (propTenantCode && propTenantCode !== tenantCode) {
      setTenantCode(propTenantCode);
      setPortals(getStoredPortalConfigs(propTenantCode));
    }
  }, [propTenantCode, tenantCode]);

  const applySinglePortalPatch = useCallback(
    (code: string, config: PortalSummaryConfig, eventTenant?: string, rebroadcast = true) => {
      const targetTenant = eventTenant || getActiveTenantCode(propTenantCode);
      setPortals((prev) => {
        const next = { ...prev, [code]: config };
        persistPortalConfigs(targetTenant, next);
        return next;
      });
      setLastSyncedAt(config.updated_at || new Date().toISOString());
      if (portalCode && code === String(portalCode).toLowerCase()) {
        applyPortalLiveBranding(code, config);
      }
      if (rebroadcast) {
        try {
          broadcastEvent('EVENT_APPENDED', {
            tenant_code: targetTenant,
            payload: {
              module: 'tenant',
              event_type: 'portal_config_updated',
              tenant_code: targetTenant,
              portal_code: code,
              config,
            },
          });
        } catch {
          // ignore
        }
      }
    },
    [portalCode, propTenantCode]
  );

  const refreshPortalSettings = useCallback(
    async (overrideTenant?: string): Promise<Record<string, PortalSummaryConfig>> => {
      const tc = getActiveTenantCode(overrideTenant || propTenantCode);
      setTenantCode(tc);
      setLoading(true);
      try {
        const host = typeof window !== 'undefined' ? window.location.host : '';
        const isLocal =
          !host ||
          host.includes('localhost') ||
          host.includes('127.0.0.1');
        const params: Record<string, string> =
          tc && tc !== 'platform'
            ? { code: tc }
            : isLocal
              ? { code: tc || 'platform' }
              : { host };

        const data = await fetchTenantResolution(params);
        const resolvedTenant = data?.tenant_code || tc;
        const nextPortals: Record<string, PortalSummaryConfig> = data?.portals || {};

        if (mountedRef.current && Object.keys(nextPortals).length > 0) {
          setTenantCode(resolvedTenant);
          setPortals(nextPortals);
          setLastSyncedAt(new Date().toISOString());
          if (portalCode) {
            const p = nextPortals[String(portalCode).toLowerCase()];
            if (p) applyPortalLiveBranding(String(portalCode).toLowerCase(), p);
          }
        }
        return nextPortals;
      } catch {
        return getStoredPortalConfigs(tc);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [portalCode, propTenantCode]
  );

  useEffect(() => {
    refreshPortalSettings();

    const handleAuthOrTenantChange = () => {
      const latestTenant = getActiveTenantCode(propTenantCode);
      setTenantCode(latestTenant);
      setPortals(getStoredPortalConfigs(latestTenant));
      refreshPortalSettings(latestTenant);
    };

    const handleNotificationReceived = (evt: any) => {
      const update = extractPortalUpdateFromPayload(evt?.detail);
      if (!update) return;
      const currentTc = getActiveTenantCode(propTenantCode);
      if (update.tenant_code && update.tenant_code !== currentTc) return;
      applySinglePortalPatch(update.portal_code, update.config, update.tenant_code, true);
    };

    const handleCustomConfigUpdated = (evt: any) => {
      const detail = evt?.detail;
      if (detail?.portals && typeof detail.portals === 'object') {
        const currentTc = getActiveTenantCode(propTenantCode);
        if (detail.tenant_code && detail.tenant_code !== currentTc) return;
        setPortals(detail.portals);
        setLastSyncedAt(new Date().toISOString());
      }
    };

    const handleStorage = (evt: StorageEvent) => {
      const currentTc = getActiveTenantCode(propTenantCode);
      if (evt.key === 'tenant_code' || evt.key === 'app_login_event') {
        handleAuthOrTenantChange();
      } else if (evt.key === `${PORTAL_CONFIG_STORAGE_PREFIX}${currentTc}` && evt.newValue) {
        try {
          const parsed = JSON.parse(evt.newValue);
          if (parsed && typeof parsed === 'object') {
            setPortals(parsed);
            setLastSyncedAt(new Date().toISOString());
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('app_login_event', handleAuthOrTenantChange);
    window.addEventListener('notification_received', handleNotificationReceived);
    window.addEventListener(PORTAL_CONFIG_UPDATED_EVENT, handleCustomConfigUpdated);
    window.addEventListener('storage', handleStorage);

    const unsubscribeBroadcast = subscribeBroadcast((msg: any) => {
      if (msg?.type !== 'EVENT_APPENDED') return;
      const update = extractPortalUpdateFromPayload(msg?.payload?.payload || msg?.payload);
      if (!update) return;
      const currentTc = getActiveTenantCode(propTenantCode);
      if (update.tenant_code && update.tenant_code !== currentTc) return;
      applySinglePortalPatch(update.portal_code, update.config, update.tenant_code, false);
    });

    return () => {
      window.removeEventListener('app_login_event', handleAuthOrTenantChange);
      window.removeEventListener('notification_received', handleNotificationReceived);
      window.removeEventListener(PORTAL_CONFIG_UPDATED_EVENT, handleCustomConfigUpdated);
      window.removeEventListener('storage', handleStorage);
      unsubscribeBroadcast();
    };
  }, [propTenantCode, refreshPortalSettings, applySinglePortalPatch]);

  useNotificationConsumer('tenant', (event: any) => {
    const update = extractPortalUpdateFromPayload(event);
    if (!update) return;
    const currentTc = getActiveTenantCode(propTenantCode);
    if (update.tenant_code && update.tenant_code !== currentTc) return;
    applySinglePortalPatch(update.portal_code, update.config, update.tenant_code, true);
  });

  useRefreshOnVisible(() => {
    refreshPortalSettings();
  });

  const value = useMemo<PortalSettingsContextValue>(
    () => ({
      tenantCode,
      activePortalCode: portalCode ? String(portalCode).toLowerCase() : undefined,
      portals,
      loading,
      lastSyncedAt,
      refreshPortalSettings,
    }),
    [tenantCode, portalCode, portals, loading, lastSyncedAt, refreshPortalSettings]
  );

  return React.createElement(PortalSettingsContext.Provider, { value }, children);
};

const useStandalonePortalStore = (portalCode: string) => {
  const [portals, setPortals] = useState<Record<string, PortalSummaryConfig>>(() =>
    getStoredPortalConfigs()
  );
  const [loading, setLoading] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const refreshPortalSettings = useCallback(async () => {
    const tc = getActiveTenantCode();
    setLoading(true);
    try {
      const data = await fetchTenantResolution(
        tc && tc !== 'platform' ? { code: tc } : { code: 'platform' }
      );
      const nextPortals = data?.portals || {};
      if (Object.keys(nextPortals).length > 0) {
        setPortals(nextPortals);
        setLastSyncedAt(new Date().toISOString());
      }
      return nextPortals;
    } catch {
      return getStoredPortalConfigs(tc);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const code = String(portalCode).toLowerCase();
    const handleCustomUpdated = (evt: any) => {
      if (evt?.detail?.portals) {
        setPortals(evt.detail.portals);
        setLastSyncedAt(new Date().toISOString());
      }
    };
    const handleNotif = (evt: any) => {
      const update = extractPortalUpdateFromPayload(evt?.detail);
      if (update && update.portal_code === code) {
        const currentTc = getActiveTenantCode();
        setPortals((prev) => {
          const next = { ...prev, [code]: update.config };
          persistPortalConfigs(update.tenant_code || currentTc, next);
          return next;
        });
        setLastSyncedAt(new Date().toISOString());
      }
    };
    window.addEventListener(PORTAL_CONFIG_UPDATED_EVENT, handleCustomUpdated);
    window.addEventListener('notification_received', handleNotif);
    return () => {
      window.removeEventListener(PORTAL_CONFIG_UPDATED_EVENT, handleCustomUpdated);
      window.removeEventListener('notification_received', handleNotif);
    };
  }, [portalCode]);

  return { portals, loading, lastSyncedAt, refreshPortalSettings };
};

export function usePortalSettings(portalCode?: PortalCode) {
  const ctx = useContext(PortalSettingsContext);
  const code = String(portalCode || ctx?.activePortalCode || 'customer').toLowerCase();
  const standalone = useStandalonePortalStore(code);

  const portals = ctx ? ctx.portals : standalone.portals;
  const loading = ctx ? ctx.loading : standalone.loading;
  const lastSyncedAt = ctx ? ctx.lastSyncedAt : standalone.lastSyncedAt;
  const refreshPortalSettings = ctx ? ctx.refreshPortalSettings : standalone.refreshPortalSettings;

  const portal = portals[code] || null;
  const defaultLandingRoute = resolvePortalLandingPath(portal, code);

  const isAgentVisible = useCallback(
    (agentId: string): boolean => {
      if (!portal || !Array.isArray(portal.visible_agents) || portal.visible_agents.length === 0) {
        return true;
      }
      return portal.visible_agents.includes(agentId);
    },
    [portal]
  );

  return {
    portal,
    portals,
    portalCode: code,
    isEnabled: portal?.is_enabled ?? true,
    landingMode: (portal?.landing_mode as PortalLandingMode) || 'DASHBOARD',
    defaultLandingRoute,
    defaultAgentId: portal?.default_agent_id || '',
    visibleAgents: portal?.visible_agents || [],
    settings: portal?.settings || {},
    loading,
    lastSyncedAt,
    isAgentVisible,
    refreshPortalSettings,
  };
}

export function useCustomerPortalSettings() {
  const base = usePortalSettings('customer');
  const settings = base.settings || {};

  return {
    ...base,
    config: base.portal,
    showCatalog: settings.show_catalog !== undefined ? Boolean(settings.show_catalog) : true,
    enableSupportTickets:
      settings.enable_support_tickets !== undefined
        ? Boolean(settings.enable_support_tickets)
        : true,
    allowSelfRegistration:
      settings.allow_self_registration !== undefined
        ? Boolean(settings.allow_self_registration)
        : true,
    defaultAgentTab: String(settings.default_agent_tab || 'chat'),
    appName: base.portal?.app_name || base.portal?.display_name || 'Customer Portal',
    logoUrl: base.portal?.logo_url || '',
    faviconUrl: base.portal?.favicon_url || '/favicon.png',
    themeColor: base.portal?.theme_color || '',
    refresh: base.refreshPortalSettings,
  };
}

export interface PortalPostLoginRedirectProps {
  portalCode: PortalCode;
  fromPath?: string;
  expectedDefault: string;
}

/**
 * Watches route transitions immediately following login and forwards to the portal's
 * configured defaultLandingRoute when it differs from the app's fallback login target.
 */
export const PortalPostLoginRedirect: React.FC<PortalPostLoginRedirectProps> = ({
  portalCode,
  fromPath = '/login',
  expectedDefault,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const prevPathRef = useRef<string>(location.pathname);
  const { defaultLandingRoute, refreshPortalSettings } = usePortalSettings(portalCode);

  useEffect(() => {
    const prev = prevPathRef.current;
    const curr = location.pathname;
    prevPathRef.current = curr;

    if (prev === fromPath && curr === expectedDefault) {
      refreshPortalSettings().then((updatedMap) => {
        const cfg = updatedMap?.[String(portalCode).toLowerCase()];
        const resolved = resolvePortalLandingPath(cfg, portalCode) || defaultLandingRoute;
        if (resolved && resolved !== expectedDefault) {
          navigate(resolved, { replace: true });
        }
      });
    }
  }, [location.pathname, fromPath, expectedDefault, portalCode, defaultLandingRoute, refreshPortalSettings, navigate]);

  return null;
};
