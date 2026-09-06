import { apiClient } from '../api/client';

export interface PostalArea {
  name: string;
  city: string;
  is_delivery: boolean;
}

export interface PostalCodeDetails {
  pincode: string;
  state: string;
  city: string;
  districts: string[];
  areas: string[];
  area_list?: PostalArea[];
  total_areas: number;
}

export interface PostalCodeQueryOptions {
  city?: string;
  search?: string;
  deliveryOnly?: boolean;
}

/**
 * Look up postal code details (state, city, districts, areas) from the embedded contacts postal API.
 */
export async function fetchPostalCodeDetails(
  pincode: string,
  options?: PostalCodeQueryOptions
): Promise<PostalCodeDetails | null> {
  const cleanPin = (pincode || '').trim().replace(/\D/g, '');
  if (cleanPin.length !== 6) {
    return null;
  }

  const params = new URLSearchParams();
  if (options?.city) params.append('city', options.city);
  if (options?.search) params.append('search', options.search);
  if (options?.deliveryOnly) params.append('delivery_only', 'true');

  const queryString = params.toString() ? `?${params.toString()}` : '';
  try {
    const res = await apiClient.get(`/contacts/postal-code/${cleanPin}${queryString}`);
    return res.data?.data || (res.data as any) || null;
  } catch (err: any) {
    // 404 is expected for non-existent PIN codes
    if (err.response?.status !== 404) {
      console.warn(`Postal code lookup failed for ${cleanPin}:`, err);
    }
    return null;
  }
}

let cachedStates: string[] | null = null;

/**
 * Fetch all distinct states from the embedded contacts postal API.
 */
export async function fetchPostalStates(): Promise<string[]> {
  if (cachedStates && cachedStates.length > 0) {
    return cachedStates;
  }
  try {
    const res = await apiClient.get('/contacts/postal-code/states');
    const list = res.data?.data || (res.data as any) || [];
    if (Array.isArray(list) && list.length > 0) {
      cachedStates = list;
      return list;
    }
  } catch (err) {
    console.warn('Failed to fetch postal states from backend API:', err);
  }
  return [];
}
