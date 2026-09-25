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

export const metaWaDelete = async <T = any>(endpoint: string, params?: any) => {
  const target = normalizeMetaWaEndpoint(endpoint);
  try {
    return await apiClient.delete<T>(target, { params });
  } catch (err: any) {
    if (err.response?.status === 404 && target.startsWith('/notification')) {
      return await apiClient.delete<T>(target.replace('/notification', ''), { params });
    }
    throw err;
  }
};

export const metaWaUpload = async <T = any>(endpoint: string, formData: FormData) => {
  const target = normalizeMetaWaEndpoint(endpoint);
  const headers = { 'Content-Type': 'multipart/form-data' };
  try {
    return await apiClient.post<T>(target, formData, { headers });
  } catch (err: any) {
    if (err.response?.status === 404 && target.startsWith('/notification')) {
      return await apiClient.post<T>(target.replace('/notification', ''), formData, { headers });
    }
    throw err;
  }
};

export const deleteMetaTemplate = async (templateName: string, accountId?: string) => {
  return await metaWaDelete(`/templates/${encodeURIComponent(templateName)}`, {
    account_id: accountId,
  });
};

export const uploadTemplateSample = async (file: File, accountId?: string) => {
  const fd = new FormData();
  fd.append('file', file);
  if (accountId) {
    fd.append('account_id', accountId);
  }
  return await metaWaUpload<{ handle: string }>('/upload-sample-handle', fd);
};

export const sendDocumentMessage = async (data: {
  recipient_phone: string;
  document_url: string;
  filename?: string;
  caption?: string;
  template_name?: string;
  template_params?: string[];
  payment_url?: string;
  account_id?: string;
}) => {
  return await metaWaPost('/send-document', data);
};
