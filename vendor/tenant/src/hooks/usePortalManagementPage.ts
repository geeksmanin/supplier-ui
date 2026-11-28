import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser, useRefreshOnVisible, useToast } from '@geeksman/core-ui';
import { usePortalManagement } from './usePortalManagement';
import type {
  PortalLandingMode,
  TenantPortalRecord,
} from '../types/portal';
import type {
  PortalFormState,
  PortalManagementViewProps,
  RegisterPortalFormState,
} from '../components/PortalManagement/PortalManagement.types';

const EMPTY_FORM: PortalFormState = {
  display_name: '',
  description: '',
  is_enabled: true,
  landing_mode: 'DASHBOARD',
  default_route: '/home',
  default_agent_id: '',
  visible_agents: [],
  app_name: '',
  logo_url: '',
  favicon_url: '',
  theme_color: '',
  settings: {},
};

const EMPTY_REGISTER_FORM: RegisterPortalFormState = {
  portal_code: '',
  display_name: '',
  description: '',
  app_repo: '',
  landing_mode: 'DASHBOARD',
  default_route: '/home',
  propagate_all_tenants: true,
};

const toFormState = (portal: TenantPortalRecord): PortalFormState => ({
  display_name: portal.display_name || '',
  description: portal.description || '',
  is_enabled: portal.is_enabled ?? true,
  landing_mode: (portal.landing_mode as PortalLandingMode) || 'DASHBOARD',
  default_route: portal.default_route || '/home',
  default_agent_id: portal.default_agent_id || '',
  visible_agents: Array.isArray(portal.visible_agents) ? portal.visible_agents : [],
  app_name: portal.app_name || '',
  logo_url: portal.logo_url || '',
  favicon_url: portal.favicon_url || '',
  theme_color: portal.theme_color || '',
  settings: portal.settings ? { ...portal.settings } : {},
});

export function usePortalManagementPage(): PortalManagementViewProps {
  const { portalCode: routePortalCode } = useParams<{ portalCode?: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    portals,
    loading,
    saving,
    fetchPortals,
    registerPortal,
    updatePortal,
    resetPortal,
  } = usePortalManagement();

  const [selectedCode, setSelectedCode] = useState<string>(routePortalCode || 'customer');
  const [formData, setFormData] = useState<PortalFormState>(EMPTY_FORM);
  const [registerForm, setRegisterForm] = useState<RegisterPortalFormState>(EMPTY_REGISTER_FORM);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);

  const isPlatformAdmin = useMemo(() => {
    const user = getCurrentUser();
    const tenantCode =
      localStorage.getItem('portal_tenant_code') ||
      localStorage.getItem('tenant_code') ||
      user?.tenantCode ||
      '';
    const rawRoles = (user as any)?.roles;
    const roles: string[] = Array.isArray(rawRoles) ? rawRoles : [];
    return (
      (tenantCode === 'platform' || tenantCode === 'default') &&
      (roles.includes('platform-admin') || roles.includes('admin'))
    );
  }, []);

  const loadPortals = useCallback(async () => {
    try {
      const list = await fetchPortals();
      if (list.length > 0) {
        const target =
          list.find((p) => p.portal_code === (routePortalCode || selectedCode)) || list[0];
        setSelectedCode(target.portal_code);
        setFormData(toFormState(target));
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to load portals', 'error');
    }
  }, [fetchPortals, routePortalCode, selectedCode, showToast]);

  useEffect(() => {
    loadPortals();
  }, [loadPortals]);

  useRefreshOnVisible(() => {
    loadPortals();
  });

  useEffect(() => {
    if (routePortalCode && routePortalCode !== selectedCode) {
      setSelectedCode(routePortalCode);
    }
  }, [routePortalCode, selectedCode]);

  const filteredPortals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return portals;
    return portals.filter(
      (p) =>
        p.display_name.toLowerCase().includes(q) ||
        p.portal_code.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
    );
  }, [portals, searchQuery]);

  const selectedPortal = useMemo(
    () => portals.find((p) => p.portal_code === selectedCode) || filteredPortals[0] || null,
    [portals, filteredPortals, selectedCode]
  );

  const handleSelectPortal = useCallback(
    (code: string, openMobileDrawer = false) => {
      setSelectedCode(code);
      const target = portals.find((p) => p.portal_code === code);
      if (target) {
        setFormData(toFormState(target));
      }
      if (openMobileDrawer) {
        setMobileEditorOpen(true);
      }
      if (routePortalCode) {
        navigate(`/settings/portals/${code}`);
      }
    },
    [portals, navigate, routePortalCode]
  );

  const handleFieldChange = useCallback(
    <K extends keyof PortalFormState>(field: K, value: PortalFormState[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleRegisterFieldChange = useCallback(
    <K extends keyof RegisterPortalFormState>(field: K, value: RegisterPortalFormState[K]) => {
      setRegisterForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSettingChange = useCallback((key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      settings: { ...prev.settings, [key]: value },
    }));
  }, []);

  const handleToggleVisibleAgent = useCallback((agentId: string) => {
    setFormData((prev) => {
      const exists = prev.visible_agents.includes(agentId);
      const next = exists
        ? prev.visible_agents.filter((id) => id !== agentId)
        : [...prev.visible_agents, agentId];
      return { ...prev, visible_agents: next };
    });
  }, []);

  const handleSave = useCallback(
    (closeDrawerAfter = false) => {
      if (!selectedPortal) return;
      if (!formData.default_route.trim().startsWith('/')) {
        showToast('Default route must start with /', 'error');
        return;
      }
      void updatePortal(selectedPortal.portal_code, {
        display_name: formData.display_name,
        description: formData.description,
        is_enabled: formData.is_enabled,
        landing_mode: formData.landing_mode,
        default_route: formData.default_route.trim(),
        default_agent_id: formData.default_agent_id,
        visible_agents: formData.visible_agents,
        app_name: formData.app_name,
        logo_url: formData.logo_url,
        favicon_url: formData.favicon_url,
        theme_color: formData.theme_color,
        settings: formData.settings,
      })
        .then((updated) => {
          setFormData(toFormState(updated));
          if (closeDrawerAfter) {
            setMobileEditorOpen(false);
          }
          showToast(`${updated.display_name} settings saved and pushed live`, 'success');
        })
        .catch((err: any) => {
          showToast(err?.response?.data?.message || 'Failed to save portal settings', 'error');
        });
    },
    [selectedPortal, formData, updatePortal, showToast]
  );

  const handleConfirmReset = useCallback(() => {
    if (!selectedPortal) return;
    void resetPortal(selectedPortal.portal_code)
      .then((reset) => {
        setFormData(toFormState(reset));
        setIsResetConfirmOpen(false);
        showToast(`${reset.display_name} restored to defaults`, 'success');
      })
      .catch((err: any) => {
        showToast(err?.response?.data?.message || 'Failed to reset portal', 'error');
      });
  }, [selectedPortal, resetPortal, showToast]);

  const handleRegisterSubmit = useCallback(() => {
    if (!registerForm.portal_code.trim() || !registerForm.display_name.trim()) {
      showToast('Portal code and display name are required', 'error');
      return;
    }
    void registerPortal({
      portal_code: registerForm.portal_code.trim().toLowerCase(),
      display_name: registerForm.display_name.trim(),
      description: registerForm.description.trim(),
      app_repo: registerForm.app_repo.trim(),
      default_landing_mode: (registerForm.landing_mode as PortalLandingMode) || 'DASHBOARD',
      default_route: registerForm.default_route.trim() || '/',
      propagate_all_tenants: registerForm.propagate_all_tenants,
    })
      .then((created) => {
        setIsRegisterModalOpen(false);
        setRegisterForm(EMPTY_REGISTER_FORM);
        if (created) {
          setSelectedCode(created.portal_code);
          setFormData(toFormState(created));
        }
        showToast(`Portal "${created.display_name}" registered`, 'success');
      })
      .catch((err: any) => {
        showToast(err?.response?.data?.message || 'Failed to register portal', 'error');
      });
  }, [registerForm, registerPortal, showToast]);

  return {
    portals: filteredPortals,
    selectedPortal,
    formData,
    registerForm,
    loading,
    saving,
    searchQuery,
    isPlatformAdmin,
    isRegisterModalOpen,
    isResetConfirmOpen,
    mobileEditorOpen,
    onSearchChange: setSearchQuery,
    onSelectPortal: handleSelectPortal,
    onCloseMobileEditor: () => setMobileEditorOpen(false),
    onRefresh: () => void loadPortals(),
    onFieldChange: handleFieldChange,
    onRegisterFieldChange: handleRegisterFieldChange,
    onSettingChange: handleSettingChange,
    onToggleVisibleAgent: handleToggleVisibleAgent,
    onSave: () => handleSave(false),
    onSaveAndCloseDrawer: () => handleSave(true),
    onOpenResetConfirm: () => setIsResetConfirmOpen(true),
    onCloseResetConfirm: () => setIsResetConfirmOpen(false),
    onConfirmReset: handleConfirmReset,
    onOpenRegisterModal: () => {
      setRegisterForm(EMPTY_REGISTER_FORM);
      setIsRegisterModalOpen(true);
    },
    onCloseRegisterModal: () => setIsRegisterModalOpen(false),
    onRegisterSubmit: handleRegisterSubmit,
  };
}
