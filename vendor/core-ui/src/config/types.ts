export type EnvironmentType = 'local' | 'staging' | 'production' | 'testing';

export interface BaseAppConfig {
  /** Resolved API Base URL (e.g. "https://erpapi.geeksman.co.in/api/v1" or "http://localhost:8089/api/v1") */
  apiBaseUrl: string;
  /** Active application runtime environment */
  environment?: EnvironmentType;

  /** Active Tenant / Workspace Code (e.g. "a3pl", "synchx", "swastik") */
  tenantCode?: string;
  /** Friendly organization / tenant name */
  tenantName?: string;
  /** Fallback tenant code if none resolved (default: "platform" or "business") */
  defaultTenant: string;
  /** Enable automatic tenant code resolution from browser URL / subdomain */
  resolveTenantFromUrl: boolean;

  /** True if an actual organization tenant has been resolved (not "business" or empty) */
  isTenantResolved?: boolean;
  /** True if the current tenant is the generic "business" placeholder */
  isBusinessWorkspace?: boolean;
  /** True if the UI needs to display a workspace selection prompt */
  requiresWorkspaceSelection?: boolean;

  /** Historical last used workspace code on this device (preserved even when on generic business portal) */
  lastUsedWorkspace?: string;
  /** Historical last used organization / tenant name */
  lastUsedWorkspaceName?: string;

  /** Microservice endpoints */
  ticketingApiBaseUrl?: string;
  commentsApiBaseUrl?: string;
  notificationApiBaseUrl?: string;
  backendPort?: string;
}

/**
 * Generic configuration structure allowing any application
 * (POS, Ajit Pharma, Customer Portal, ERP Staff) to bind custom configuration attributes.
 */
export type AppConfig<T = Record<string, any>> = BaseAppConfig & T;

export interface EnvironmentConfigs<T = Record<string, any>> {
  local: AppConfig<T>;
  staging: AppConfig<T>;
  prod: AppConfig<T>;
  testing?: AppConfig<T>;
}
