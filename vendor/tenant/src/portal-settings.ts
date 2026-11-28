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
export { usePortalManagement } from './hooks/usePortalManagement';
export type {
  PortalCode,
  PortalLandingMode,
  PortalAgentOption,
  PortalRouteOption,
  TenantPortalRecord,
  RegisterPortalPayload,
  UpdatePortalPayload,
} from './types/portal';
