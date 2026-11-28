export { Login, LoginDesktop, LoginMobile } from './components/Login/Login';
export { Dashboard as TenantDashboard } from './components/Dashboard/Dashboard';
export { TenantSetup } from './components/TenantSetup/TenantSetup';
export { PlatformSetup } from './components/PlatformSetup/PlatformSetup';
export { BranchesList } from './components/BranchSetup/BranchesList';
export { BranchFormPage } from './components/BranchSetup/BranchFormPage';
export { PortalManagement } from './components/PortalManagement/PortalManagement';
export { registerTenantModule, registerBranchesModule } from './register';
export { applyDynamicBranding, useTenantBranding } from './branding';
export type { DynamicBrandingOptions, TenantBranding } from './branding';
export { useTenantAuth, logoutTenant, logoutStaff } from './hooks/useTenantAuth';
export type { TenantLoginPayload } from './hooks/useTenantAuth';
export { usePortalManagement } from './hooks/usePortalManagement';
export {
  PORTAL_CONFIG_STORAGE_PREFIX,
  PORTAL_CONFIG_UPDATED_EVENT,
  getStoredPortalConfigs,
  persistPortalConfigs,
} from './utils/portalConfigStore';
export type { PortalSummaryConfig } from './utils/portalConfigStore';
export {
  PortalSettingsProvider,
  PortalPostLoginRedirect,
  usePortalSettings,
  useCustomerPortalSettings,
  resolvePortalLandingPath,
  fetchTenantResolution,
} from './hooks/usePortalSettings';
export type { PortalSettingsProviderProps, PortalPostLoginRedirectProps } from './hooks/usePortalSettings';
export type {
  PortalCode,
  PortalLandingMode,
  PortalAgentOption,
  PortalRouteOption,
  TenantPortalRecord,
  RegisterPortalPayload,
  UpdatePortalPayload,
} from './types/portal';

