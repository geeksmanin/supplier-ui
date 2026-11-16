import { apiClient } from './client';
import type { SelectAsyncConfig, SelectOption } from '../components/Select';

export interface FetchSelectOptionsParams {
  asyncConfig: SelectAsyncConfig;
  searchTerm: string;
  signal?: AbortSignal;
}

/**
 * Fetches and transforms options for async Select components using the unified apiClient.
 * Automatically handles baseURL, relative or absolute URLs, tenant/branch headers, and cancellation signals.
 */
export async function fetchSelectOptions({
  asyncConfig,
  searchTerm,
  signal,
}: FetchSelectOptionsParams): Promise<SelectOption[]> {
  const searchKey = asyncConfig.searchParam ?? 'search';
  const params: Record<string, string | number> = {
    ...(asyncConfig.params ?? {}),
    [searchKey]: searchTerm,
  };

  const response = await apiClient.get(asyncConfig.url, {
    params,
    signal,
  });

  return asyncConfig.transform(response.data) || [];
}
