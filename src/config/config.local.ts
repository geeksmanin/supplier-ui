import { AppConfig } from './types';

export const config: AppConfig = {
  apiBaseUrl: 'http://localhost:8082/api/v1',
  defaultTenant: 'platform',
  resolveTenantFromUrl: false,
  ticketingApiBaseUrl: 'http://localhost:8082/api/v1/ticketing',
  commentsApiBaseUrl: 'http://localhost:8082/api/v1/comments',
  notificationApiBaseUrl: 'http://localhost:8082',
};
