import type { PortalSummaryConfig } from '../utils/portalConfigStore';

export type PortalCode =
  | 'customer'
  | 'samwad'
  | 'supplier'
  | 'supplier_marketplace'
  | string;

export type PortalLandingMode = 'DASHBOARD' | 'AGENT' | 'CUSTOM_ROUTE';

export interface PortalAgentOption {
  id: string;
  slug: string;
  name: string;
  route: string;
}

export interface PortalRouteOption {
  route: string;
  label: string;
}

export interface TenantPortalRecord extends PortalSummaryConfig {
  id: string;
  tenant_code: string;
  description: string;
  app_repo: string;
  available_agents: PortalAgentOption[];
  available_routes: PortalRouteOption[];
  is_system_registered: boolean;
}

export interface RegisterPortalPayload {
  portal_code: string;
  display_name: string;
  description?: string;
  app_repo?: string;
  default_landing_mode?: PortalLandingMode;
  default_route: string;
  default_agent_id?: string;
  available_agents?: PortalAgentOption[];
  available_routes?: PortalRouteOption[];
  default_settings?: Record<string, any>;
  propagate_all_tenants?: boolean;
}

export interface UpdatePortalPayload {
  tenant_code?: string;
  display_name?: string;
  description?: string;
  is_enabled?: boolean;
  landing_mode?: PortalLandingMode;
  default_route?: string;
  default_agent_id?: string;
  visible_agents?: string[];
  app_name?: string;
  logo_url?: string;
  favicon_url?: string;
  theme_color?: string;
  settings?: Record<string, any>;
}
