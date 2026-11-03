import { apiClient } from '../api/client';

export interface CoreLocationItem {
  id: string;
  code?: string;
  name?: string;
  business_code?: string;
  parent_id?: string | null;
  role?: string;
  is_sellable?: boolean;
  [key: string]: any;
}

export interface FetchLocationsOptions {
  limit?: number;
  search?: string;
  is_sellable?: boolean;
}

export async function fetchLocationsList(options: FetchLocationsOptions = {}): Promise<CoreLocationItem[]> {
  try {
    const res = await apiClient.get('/locations', {
      params: {
        limit: options.limit ?? 1000,
        ...(options.search ? { search: options.search } : {}),
        ...(options.is_sellable !== undefined ? { is_sellable: options.is_sellable } : {}),
      },
    });
    return res.data?.data || res.data || [];
  } catch (err) {
    console.warn('Failed to fetch locations list:', err);
    return [];
  }
}

