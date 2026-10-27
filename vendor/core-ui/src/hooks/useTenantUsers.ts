import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';

export interface TenantUserItem {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar_url?: string;
  phone?: string;
  branch_code?: string;
  [key: string]: any;
}

export function useTenantUsers() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<TenantUserItem[]>([]);

  const fetchUsers = useCallback(async (params?: Record<string, any>): Promise<TenantUserItem[]> => {
    setLoading(true);
    try {
      const res = await apiClient.get('/tenant/users/directory', { params })
        .catch(() => apiClient.get('/tenant/users', { params }));
      const list = res?.data?.data || res?.data || [];
      const safeList = Array.isArray(list) ? list : [];
      setUsers(safeList);
      return safeList;
    } catch (e) {
      console.warn('Failed to fetch tenant users directory:', e);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { users, loading, fetchUsers };
}
