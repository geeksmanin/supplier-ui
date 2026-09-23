import { useState, useCallback, useMemo } from 'react';
import { apiClient, getBaseUrl } from '@geeksman/core-ui';
import axios from 'axios';

export interface WhatsAppConnectionInfo {
  connection_id: string;
  phone_number: string;
  display_name?: string;
  status: string;
  last_seen_at?: string;
}

export interface WhatsAppStatusInfo {
  connected: boolean;
  status: string;
  phone_number?: string;
  display_name?: string;
  connection_id?: string;
}

export interface CheckNumberResult {
  isOnWhatsApp: boolean;
  phone: string;
  error?: string;
  isConnectionInactive?: boolean;
}

export interface SendMessagePayload {
  to: string;
  text?: string;
  mediaType?: 'pdf' | 'image' | 'text' | '';
  mediaBlob?: Blob;
  mediaBase64?: string;
  mediaName?: string;
  caption?: string;
  from?: string;
}

export interface SendMessageResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface UseWhatsmeowWhatsappOptions {
  /** Optional default sender phone number */
  defaultSender?: string;
  /** Custom auth headers resolver to allow different portals to provide their custom headers */
  getAuthHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
  /** Custom token resolver */
  resolveToken?: () => string | null | Promise<string | null>;
  /** Custom tenant code resolver */
  resolveTenantCode?: () => string | null | Promise<string | null>;
  /** Custom API base URL override (e.g. 'https://erpapi.geeksman.co.in/api/v1') */
  apiBaseUrl?: string;
}

/**
 * Normalizes an Indian phone number:
 * - Strips whitespace, dashes, plus signs, parentheses.
 * - Handles leading zeros: e.g. 09876543210 -> 919876543210.
 * - Pre-pends 91 to standard 10-digit mobile numbers: e.g. 9876543210 -> 919876543210.
 * - Leaves international numbers with country codes intact.
 */
export const sanitizeWhatsAppPhone = (rawPhone: any): string => {
  if (rawPhone === null || rawPhone === undefined) return '';
  const str = typeof rawPhone === 'string' ? rawPhone : String(rawPhone);
  if (!str.trim()) return '';
  let digits = str.replace(/\D/g, '');

  if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }

  if (digits.length === 10) {
    digits = '91' + digits;
  }

  return digits;
};

/**
 * Converts a Blob to a raw base64 string (without the data URL prefix).
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
};

const defaultGetAuthHeaders = (): Record<string, string> => {
  const token =
    (typeof window !== 'undefined'
      ? localStorage.getItem('staff_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('erp_user_token')
      : null) || '';
  const tenantCode =
    (typeof window !== 'undefined'
      ? localStorage.getItem('staff_tenant_code') ||
        localStorage.getItem('tenant_code') ||
        localStorage.getItem('workspace_code')
      : null) || 'platform';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Tenant-Code': tenantCode,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Normalizes a WhatsApp endpoint to canonical microservice route structure.
 * Defaults to `/notification/whatsapp/*` for monolithic ERP routing,
 * while allowing transparent fallback for standalone direct endpoints.
 */
export function normalizeWaEndpoint(endpoint: any): string {
  if (!endpoint || typeof endpoint !== 'string') return '';
  let clean = endpoint.replace(/^\/api\/v1/, '');
  if (!clean.startsWith('/')) clean = '/' + clean;

  if (clean.startsWith('/whatsapp')) {
    return `/notification${clean}`;
  }
  if (!clean.startsWith('/notification/whatsapp')) {
    return `/notification/whatsapp${clean}`;
  }
  return clean;
}

/**
 * Custom hook providing seamless interaction with the Whatsmeow WhatsApp backend integration.
 * Centralizes directory checks, message dispatch, connection status queries, and phone sanitization.
 * Supports custom auth/token resolvers so different portals can seamlessly integrate.
 */
export const useWhatsmeowWhatsapp = (
  options?: string | UseWhatsmeowWhatsappOptions
) => {
  const configOpts = useMemo<UseWhatsmeowWhatsappOptions>(() => {
    if (typeof options === 'string') {
      return { defaultSender: options };
    }
    return options || {};
  }, [options]);

  const [isChecking, setIsChecking] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [connections, setConnections] = useState<WhatsAppConnectionInfo[]>([]);
  const [status, setStatus] = useState<WhatsAppStatusInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resolveHeaders = useCallback(async (): Promise<Record<string, string>> => {
    if (configOpts.getAuthHeaders) {
      return await configOpts.getAuthHeaders();
    }
    const headers = defaultGetAuthHeaders();
    if (configOpts.resolveToken) {
      const t = await configOpts.resolveToken();
      if (t) headers['Authorization'] = `Bearer ${t}`;
    }
    if (configOpts.resolveTenantCode) {
      const tc = await configOpts.resolveTenantCode();
      if (tc) headers['X-Tenant-Code'] = tc;
    }
    return headers;
  }, [configOpts]);

  const requestGet = useCallback(
    async (endpoint: string, params?: Record<string, any>) => {
      const primary = normalizeWaEndpoint(endpoint);
      const headers = await resolveHeaders();

      // If a custom apiBaseUrl is specified, route through custom axios
      if (configOpts.apiBaseUrl) {
        const base = configOpts.apiBaseUrl.replace(/\/$/, '');
        try {
          return await axios.get(`${base}${primary}`, { params, headers });
        } catch (err: any) {
          if (err.response?.status === 404) {
            const direct = primary.replace('/notification/whatsapp', '/whatsapp');
            if (direct !== primary) {
              return await axios.get(`${base}${direct}`, { params, headers });
            }
          }
          throw err;
        }
      }

      // Default: use apiClient with /notification/whatsapp/* as primary
      try {
        return await apiClient.get(primary, { params, headers });
      } catch (err: any) {
        if (err.response?.status === 404) {
          const direct = primary.replace('/notification/whatsapp', '/whatsapp');
          if (direct !== primary) {
            try {
              return await apiClient.get(direct, { params, headers });
            } catch (err2: any) {
              if (err2.response?.status !== 404) throw err2;
            }
          }
        }
        throw err;
      }
    },
    [configOpts.apiBaseUrl, resolveHeaders]
  );

  const requestPost = useCallback(
    async (endpoint: string, data?: any) => {
      const primary = normalizeWaEndpoint(endpoint);
      const headers = await resolveHeaders();

      // If a custom apiBaseUrl is specified, route through custom axios
      if (configOpts.apiBaseUrl) {
        const base = configOpts.apiBaseUrl.replace(/\/$/, '');
        try {
          return await axios.post(`${base}${primary}`, data, { headers });
        } catch (err: any) {
          if (err.response?.status === 404) {
            const direct = primary.replace('/notification/whatsapp', '/whatsapp');
            if (direct !== primary) {
              return await axios.post(`${base}${direct}`, data, { headers });
            }
          }
          throw err;
        }
      }

      // Default: use apiClient with /notification/whatsapp/* as primary
      try {
        return await apiClient.post(primary, data, { headers });
      } catch (err: any) {
        if (err.response?.status === 404) {
          const direct = primary.replace('/notification/whatsapp', '/whatsapp');
          if (direct !== primary) {
            try {
              return await apiClient.post(direct, data, { headers });
            } catch (err2: any) {
              if (err2.response?.status !== 404) throw err2;
            }
          }
        }
        throw err;
      }
    },
    [configOpts.apiBaseUrl, resolveHeaders]
  );

  /**
   * Checks whether a phone number is registered on WhatsApp directory.
   */
  const checkNumber = useCallback(
    async (rawPhone: string, fromPhone?: string): Promise<CheckNumberResult> => {
      const cleanPhone = sanitizeWhatsAppPhone(rawPhone);
      if (!cleanPhone || cleanPhone.length < 10) {
        return { isOnWhatsApp: false, phone: cleanPhone, error: 'Invalid phone number' };
      }

      setIsChecking(true);
      setError(null);

      const sender = fromPhone || configOpts.defaultSender || '';
      const params: Record<string, string> = { phone: cleanPhone };
      if (sender) params.from = sender;

      try {
        const res = await requestGet('/whatsapp/check', params);
        const data = res.data?.data || res.data;
        const isOnWhatsApp = Boolean(data?.is_on_whatsapp);

        return {
          isOnWhatsApp,
          phone: cleanPhone,
        };
      } catch (err: any) {
        const msg =
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          'Failed to verify WhatsApp number';
        const isConnInactive =
          err.response?.status === 500 ||
          msg.toLowerCase().includes('no active paired') ||
          msg.toLowerCase().includes('not connected') ||
          msg.toLowerCase().includes('inactive') ||
          msg.toLowerCase().includes('connection') ||
          msg.toLowerCase().includes('needs to be scanned') ||
          msg.toLowerCase().includes('pairing');
        setError(msg);
        return {
          isOnWhatsApp: false,
          phone: cleanPhone,
          error: msg,
          isConnectionInactive: isConnInactive,
        };
      } finally {
        setIsChecking(false);
      }
    },
    [configOpts.defaultSender, requestGet]
  );

  /**
   * Dispatches text, image, or PDF document over WhatsApp.
   */
  const sendMessage = useCallback(
    async (payload: SendMessagePayload): Promise<SendMessageResult> => {
      const cleanTo = sanitizeWhatsAppPhone(payload.to);
      if (!cleanTo) {
        return { success: false, error: 'Recipient phone number is required.' };
      }

      setIsSending(true);
      setError(null);

      let mediaBase64 = payload.mediaBase64 || '';
      if (payload.mediaBlob && !mediaBase64) {
        try {
          mediaBase64 = await blobToBase64(payload.mediaBlob);
        } catch (e: any) {
          setIsSending(false);
          const errStr = `Failed to encode media: ${e.message}`;
          setError(errStr);
          return { success: false, error: errStr };
        }
      }

      const sender = payload.from || configOpts.defaultSender || '';
      const httpPayload = {
        from: sender,
        to: cleanTo,
        text: payload.text || '',
        media_type: payload.mediaType === 'text' ? '' : payload.mediaType || '',
        media_base64: mediaBase64,
        media_name: payload.mediaName || '',
        caption: payload.caption || payload.text || '',
      };

      try {
        const res = await requestPost('/whatsapp/send', httpPayload);
        const msg = res.data?.message || 'WhatsApp message queued for dispatch.';
        return {
          success: true,
          message: msg,
        };
      } catch (err: any) {
        const msg =
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          'Failed to dispatch WhatsApp message.';
        setError(msg);
        return {
          success: false,
          error: msg,
        };
      } finally {
        setIsSending(false);
      }
    },
    [configOpts.defaultSender, requestPost]
  );

  /**
   * Retrieves active WhatsApp connection status.
   */
  const getStatus = useCallback(
    async (fromPhone?: string): Promise<WhatsAppStatusInfo> => {
      setIsLoadingStatus(true);
      setError(null);

      const sender = fromPhone || configOpts.defaultSender || '';
      const params: Record<string, string> = {};
      if (sender) params.from = sender;

      try {
        const res = await requestGet('/whatsapp/status', params);
        const data = res.data?.data || res.data || {};
        const statusInfo: WhatsAppStatusInfo = {
          connected: data.status === 'CONNECTED' || Boolean(data.connected),
          status: data.status || (data.connected ? 'CONNECTED' : 'DISCONNECTED'),
          phone_number: data.phone_number,
          display_name: data.display_name,
          connection_id: data.connection_id,
        };

        setStatus(statusInfo);
        return statusInfo;
      } catch (err: any) {
        const msg =
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          'Failed to retrieve WhatsApp status';
        setError(msg);
        const fallback: WhatsAppStatusInfo = { connected: false, status: 'DISCONNECTED' };
        setStatus(fallback);
        return fallback;
      } finally {
        setIsLoadingStatus(false);
      }
    },
    [configOpts.defaultSender, requestGet]
  );

  /**
   * Fetches all registered WhatsApp connections for the active tenant.
   */
  const getConnections = useCallback(async (): Promise<WhatsAppConnectionInfo[]> => {
    setIsLoadingConnections(true);
    setError(null);

    try {
      const res = await requestGet('/whatsapp/connections');
      const data = res.data?.data || res.data || {};
      const conns = Array.isArray(data.connections)
        ? data.connections
        : Array.isArray(data)
        ? data
        : [];

      setConnections(conns);
      return conns;
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch WhatsApp connections';
      setError(msg);
      return [];
    } finally {
      setIsLoadingConnections(false);
    }
  }, [requestGet]);

  return {
    isChecking,
    isSending,
    isLoadingConnections,
    isLoadingStatus,
    connections,
    status,
    error,
    checkNumber,
    sendMessage,
    getStatus,
    getConnections,
    sanitizePhone: sanitizeWhatsAppPhone,
    blobToBase64,
  };
};
