import { apiClient } from '@geeksman/core-ui';

/**
 * Normalizes Meta WhatsApp API endpoint to canonical microservice route structure.
 * Resolves to `/notification/meta-whatsapp/*` for monolithic ERP routing,
 * while allowing transparent fallback for standalone direct endpoints.
 */
export const normalizeMetaWaEndpoint = (endpoint: string): string => {
  if (!endpoint) return '';
  let clean = endpoint.replace(/^\/api\/v1/, '');
  if (!clean.startsWith('/')) clean = '/' + clean;
  if (clean.startsWith('/meta-whatsapp')) {
    return `/notification${clean}`;
  }
  if (!clean.startsWith('/notification/meta-whatsapp')) {
    return `/notification/meta-whatsapp${clean}`;
  }
  return clean;
};

export const metaWaGet = async <T = any>(endpoint: string, params?: any) => {
  const target = normalizeMetaWaEndpoint(endpoint);
  try {
    return await apiClient.get<T>(target, { params });
  } catch (err: any) {
    if (err.response?.status === 404 && target.startsWith('/notification')) {
      return await apiClient.get<T>(target.replace('/notification', ''), { params });
    }
    throw err;
  }
};

export const metaWaPost = async <T = any>(endpoint: string, data?: any) => {
  const target = normalizeMetaWaEndpoint(endpoint);
  try {
    return await apiClient.post<T>(target, data);
  } catch (err: any) {
    if (err.response?.status === 404 && target.startsWith('/notification')) {
      return await apiClient.post<T>(target.replace('/notification', ''), data);
    }
    throw err;
  }
};

export const metaWaPut = async <T = any>(endpoint: string, data?: any) => {
  const target = normalizeMetaWaEndpoint(endpoint);
  try {
    return await apiClient.put<T>(target, data);
  } catch (err: any) {
    if (err.response?.status === 404 && target.startsWith('/notification')) {
      return await apiClient.put<T>(target.replace('/notification', ''), data);
    }
    throw err;
  }
};

export const metaWaDelete = async <T = any>(endpoint: string) => {
  const target = normalizeMetaWaEndpoint(endpoint);
  try {
    return await apiClient.delete<T>(target);
  } catch (err: any) {
    if (err.response?.status === 404 && target.startsWith('/notification')) {
      return await apiClient.delete<T>(target.replace('/notification', ''));
    }
    throw err;
  }
};
