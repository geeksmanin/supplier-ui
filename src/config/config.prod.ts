import { AppConfig } from './types';

export const config: AppConfig = {
  apiBaseUrl: 'https://erpapi.geeksman.co.in/api/v1',
  defaultTenant: 'platform',
  resolveTenantFromUrl: true,
  ticketingApiBaseUrl: 'https://erpapi.geeksman.co.in/api/v1/ticketing',
  commentsApiBaseUrl: 'https://erpapi.geeksman.co.in/api/v1/comments'
};
