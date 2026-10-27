import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';

export interface SalesOrderLookupResult {
  order: any;
  lines: any[];
  [key: string]: any;
}

export function useSalesOrderLookup() {
  const [loading, setLoading] = useState(false);

  const fetchSalesOrder = useCallback(async (orderId: string): Promise<any> => {
    if (!orderId) return null;
    setLoading(true);
    try {
      const res = await apiClient.get(`/sales/salesorders/${orderId}`);
      return res?.data?.data || res?.data || null;
    } catch (e) {
      console.warn(`Failed to fetch sales order ${orderId}:`, e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSalesOrderByRef = useCallback(async (referenceId: string): Promise<any> => {
    if (!referenceId) return null;
    setLoading(true);
    try {
      const res = await apiClient.get(`/sales/salesorders/ref/${referenceId}`)
        .catch(() => apiClient.get(`/sales/salesorders/${referenceId}`));
      return res?.data?.data || res?.data || null;
    } catch (e) {
      console.warn(`Failed to fetch sales order by ref ${referenceId}:`, e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, fetchSalesOrder, fetchSalesOrderByRef };
}
