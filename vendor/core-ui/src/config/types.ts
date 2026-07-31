export interface AppConfig {
  apiBaseUrl: string;
  defaultTenant: string;
  resolveTenantFromUrl: boolean;
  ticketingApiBaseUrl?: string;
  commentsApiBaseUrl?: string;
  tenantCode?: string;
}
