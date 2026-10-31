import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';
import { useToast } from '../components/Toast/Toast';

export interface UseBarcodeLookupOptions {
  lookupUrl?: string;
}

export interface UseBarcodeLookupReturn {
  scanning: boolean;
  lookupCode: (code: string) => Promise<any>;
}

export function useBarcodeLookup(options: UseBarcodeLookupOptions = {}): UseBarcodeLookupReturn {
  const { lookupUrl } = options;
  const { showToast } = useToast();
  const [scanning, setScanning] = useState(false);

  const lookupCode = useCallback(async (code: string): Promise<any> => {
    let cleanCode = code.trim();
    if (cleanCode.startsWith('{') && cleanCode.endsWith('}')) {
      try {
        const parsed = JSON.parse(cleanCode);
        cleanCode = parsed.sku || parsed.sku_code || parsed.variant_id || parsed.code || cleanCode;
      } catch {
        // fallback to raw string
      }
    }

    if (!cleanCode) return null;

    if (!lookupUrl) {
      return { sku_code: cleanCode, raw_code: cleanCode };
    }

    setScanning(true);
    try {
      const res = await apiClient.get(lookupUrl, {
        params: { search: cleanCode, limit: 10 },
      });
      const list = res.data?.data ? (Array.isArray(res.data.data) ? res.data.data : [res.data.data]) : [];
      if (list.length > 0) {
        showToast(`Item found: ${list[0].sku_code || list[0].name || cleanCode}`, 'success');
        return list[0];
      }
      return { sku_code: cleanCode, raw_code: cleanCode };
    } catch {
      return { sku_code: cleanCode, raw_code: cleanCode };
    } finally {
      setScanning(false);
    }
  }, [lookupUrl, showToast]);

  return { scanning, lookupCode };
}
