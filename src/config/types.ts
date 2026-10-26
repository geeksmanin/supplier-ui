import { AppConfig as BaseAppConfig } from '@geeksman/core-ui';

export interface SupplierCustomConfig {
  ticketingApiBaseUrl?: string;
  commentsApiBaseUrl?: string;
  notificationApiBaseUrl?: string;
}

export type AppConfig = BaseAppConfig<SupplierCustomConfig>;
