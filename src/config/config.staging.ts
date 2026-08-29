import { AppConfig } from './types';

export const config: AppConfig = {
  apiBaseUrl: 'https://erpapi-staging.geeksman.co.in/api/v1',
  defaultTenant: 'platform',
  resolveTenantFromUrl: true,
  ticketingApiBaseUrl: 'https://erpapi-staging.geeksman.co.in/api/v1/ticketing',
  commentsApiBaseUrl: 'https://erpapi-staging.geeksman.co.in/api/v1/comments'
};
