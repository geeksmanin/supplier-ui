import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../api/client';
import { getStoredFormDefaults, saveStoredFormDefaults } from '../utils/defaultsStore';

export interface UseFormDefaultsOptions {
  enabled?: boolean;
}

export interface UseFormDefaultsReturn {
  defaults: Record<string, any>;
  loading: boolean;
  loaded: boolean;
  refreshDefaults: (forceServer?: boolean) => Promise<Record<string, any>>;
  applyDefaults: <T extends Record<string, any>>(formData: T) => T;
}

export function useFormDefaults(
  formKey: string,
  options?: UseFormDefaultsOptions
): UseFormDefaultsReturn {
  const enabled = options?.enabled ?? true;
  const [defaults, setDefaults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [loaded, setLoaded] = useState<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchFromServer = useCallback(async (): Promise<Record<string, any>> => {
    try {
      const res = await apiClient.get(`/form-configurations/${formKey}`);
      const serverConfig = res.data?.data?.config || {};
      await saveStoredFormDefaults(formKey, serverConfig);
      if (mountedRef.current) {
        setDefaults(serverConfig);
        setLoaded(true);
      }
      return serverConfig;
    } catch (err) {
      console.warn(`[useFormDefaults] Failed to fetch form configurations for ${formKey}:`, err);
      return {};
    }
  }, [formKey]);

  const refreshDefaults = useCallback(
    async (forceServer = false): Promise<Record<string, any>> => {
      if (!enabled || !formKey) return {};
      if (forceServer) {
        setLoading(true);
        const fresh = await fetchFromServer();
        if (mountedRef.current) setLoading(false);
        return fresh;
      }

      // Check IndexedDB local cache first
      const cached = await getStoredFormDefaults(formKey);
      if (cached && cached.data && Object.keys(cached.data).length > 0) {
        if (mountedRef.current) {
          setDefaults(cached.data);
          setLoaded(true);
          setLoading(false);
        }
        return cached.data;
      }

      // Cache miss: fetch from server
      setLoading(true);
      const serverData = await fetchFromServer();
      if (mountedRef.current) setLoading(false);
      return serverData;
    },
    [enabled, formKey, fetchFromServer]
  );

  // Initial load
  useEffect(() => {
    refreshDefaults(false);
  }, [refreshDefaults]);

  // Listen for cross-component live updates
  useEffect(() => {
    const handleDefaultsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ formKey: string; config?: Record<string, any> }>;
      if (customEvent.detail && customEvent.detail.formKey === formKey) {
        if (customEvent.detail.config) {
          setDefaults(customEvent.detail.config);
          setLoaded(true);
        } else {
          refreshDefaults(true);
        }
      }
    };

    window.addEventListener('form_defaults_updated', handleDefaultsUpdated);
    return () => window.removeEventListener('form_defaults_updated', handleDefaultsUpdated);
  }, [formKey, refreshDefaults]);

  /**
   * Helper to merge defaults into a form data object without overriding non-empty values
   */
  const applyDefaults = useCallback(
    <T extends Record<string, any>>(formData: T): T => {
      const merged = { ...formData };
      for (const [key, val] of Object.entries(defaults)) {
        if (val !== undefined && val !== null && val !== '') {
          // If field in formData is empty/unset, apply default
          if ((merged as any)[key] === undefined || (merged as any)[key] === '' || (merged as any)[key] === null) {
            (merged as any)[key] = val;
          }
        }
      }
      return merged;
    },
    [defaults]
  );

  return {
    defaults,
    loading,
    loaded,
    refreshDefaults,
    applyDefaults,
  };
}
