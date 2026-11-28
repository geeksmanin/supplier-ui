import { useState, useCallback } from 'react';
import { apiClient, broadcastEvent } from '@geeksman/core-ui';
import {
  getStoredPortalConfigs,
  persistPortalConfigs,
} from '../utils/portalConfigStore';
import type {
  TenantPortalRecord,
  RegisterPortalPayload,
  UpdatePortalPayload,
} from '../types/portal';

const toSummarySnapshot = (portal: TenantPortalRecord) => ({
  portal_code: portal.portal_code,
  display_name: portal.display_name,
  is_enabled: portal.is_enabled,
  landing_mode: portal.landing_mode,
  default_route: portal.default_route,
  default_agent_id: portal.default_agent_id,
  visible_agents: portal.visible_agents || [],
  app_name: portal.app_name,
  logo_url: portal.logo_url,
  favicon_url: portal.favicon_url,
  theme_color: portal.theme_color,
  settings: portal.settings || {},
  updated_at: portal.updated_at,
});

const syncPortalLocalSnapshot = (portal: TenantPortalRecord) => {
  if (!portal?.tenant_code || !portal?.portal_code) return;
  const current = getStoredPortalConfigs(portal.tenant_code);
  const next = {
    ...current,
    [portal.portal_code]: toSummarySnapshot(portal),
  };
  persistPortalConfigs(portal.tenant_code, next);
  try {
    broadcastEvent('EVENT_APPENDED', {
      tenant_code: portal.tenant_code,
      payload: {
        module: 'tenant',
        event_type: 'portal_config_updated',
        tenant_code: portal.tenant_code,
        portal_code: portal.portal_code,
        config: next[portal.portal_code],
      },
    });
  } catch {
    // ignore broadcast errors in restricted contexts
  }
};

export function usePortalManagement() {
  const [portals, setPortals] = useState<TenantPortalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortals = useCallback(async (tenantCode?: string): Promise<TenantPortalRecord[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/tenant/portals', {
        params: tenantCode ? { tenant_code: tenantCode } : undefined,
      });
      const list: TenantPortalRecord[] = res.data?.data || [];
      setPortals(list);
      return list;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load portals';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPortal = useCallback(
    async (portalCode: string, tenantCode?: string): Promise<TenantPortalRecord> => {
      const res = await apiClient.get(`/tenant/portals/${encodeURIComponent(portalCode)}`, {
        params: tenantCode ? { tenant_code: tenantCode } : undefined,
      });
      const item: TenantPortalRecord = res.data?.data;
      if (item) {
        syncPortalLocalSnapshot(item);
      }
      return item;
    },
    []
  );

  const registerPortal = useCallback(
    async (payload: RegisterPortalPayload): Promise<TenantPortalRecord> => {
      setSaving(true);
      try {
        const res = await apiClient.post('/tenant/portals', payload);
        const created: TenantPortalRecord = res.data?.data;
        if (created) {
          setPortals((prev) => {
            const exists = prev.some((p) => p.portal_code === created.portal_code);
            return exists
              ? prev.map((p) => (p.portal_code === created.portal_code ? created : p))
              : [...prev, created];
          });
          syncPortalLocalSnapshot(created);
        }
        return created;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const updatePortal = useCallback(
    async (portalCode: string, payload: UpdatePortalPayload): Promise<TenantPortalRecord> => {
      setSaving(true);
      try {
        const res = await apiClient.put(`/tenant/portals/${encodeURIComponent(portalCode)}`, payload);
        const updated: TenantPortalRecord = res.data?.data;
        if (updated) {
          setPortals((prev) =>
            prev.map((p) => (p.portal_code === updated.portal_code ? updated : p))
          );
          syncPortalLocalSnapshot(updated);
        }
        return updated;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const resetPortal = useCallback(
    async (portalCode: string, tenantCode?: string): Promise<TenantPortalRecord> => {
      setSaving(true);
      try {
        const res = await apiClient.post(
          `/tenant/portals/${encodeURIComponent(portalCode)}/reset`,
          null,
          { params: tenantCode ? { tenant_code: tenantCode } : undefined }
        );
        const reset: TenantPortalRecord = res.data?.data;
        if (reset) {
          setPortals((prev) =>
            prev.map((p) => (p.portal_code === reset.portal_code ? reset : p))
          );
          syncPortalLocalSnapshot(reset);
        }
        return reset;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  return {
    portals,
    loading,
    saving,
    error,
    fetchPortals,
    fetchPortal,
    registerPortal,
    updatePortal,
    resetPortal,
  };
}
