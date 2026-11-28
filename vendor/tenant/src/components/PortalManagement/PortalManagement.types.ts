import type { PortalLandingMode, TenantPortalRecord } from '../../types/portal';

export interface PortalFormState {
  display_name: string;
  description: string;
  is_enabled: boolean;
  landing_mode: PortalLandingMode;
  default_route: string;
  default_agent_id: string;
  visible_agents: string[];
  app_name: string;
  logo_url: string;
  favicon_url: string;
  theme_color: string;
  settings: Record<string, any>;
}

export interface RegisterPortalFormState {
  portal_code: string;
  display_name: string;
  description: string;
  app_repo: string;
  landing_mode: PortalLandingMode;
  default_route: string;
  propagate_all_tenants: boolean;
}

export interface PortalManagementViewProps {
  portals: TenantPortalRecord[];
  selectedPortal: TenantPortalRecord | null;
  formData: PortalFormState;
  registerForm: RegisterPortalFormState;
  loading: boolean;
  saving: boolean;
  searchQuery: string;
  isPlatformAdmin: boolean;
  isRegisterModalOpen: boolean;
  isResetConfirmOpen: boolean;
  mobileEditorOpen: boolean;
  onSearchChange: (q: string) => void;
  onSelectPortal: (portalCode: string, openMobileDrawer?: boolean) => void;
  onCloseMobileEditor: () => void;
  onRefresh: () => void;
  onFieldChange: <K extends keyof PortalFormState>(field: K, value: PortalFormState[K]) => void;
  onRegisterFieldChange: <K extends keyof RegisterPortalFormState>(
    field: K,
    value: RegisterPortalFormState[K]
  ) => void;
  onSettingChange: (key: string, value: any) => void;
  onToggleVisibleAgent: (agentId: string) => void;
  onSave: () => void;
  onSaveAndCloseDrawer: () => void;
  onOpenResetConfirm: () => void;
  onCloseResetConfirm: () => void;
  onConfirmReset: () => void;
  onOpenRegisterModal: () => void;
  onCloseRegisterModal: () => void;
  onRegisterSubmit: () => void;
}
