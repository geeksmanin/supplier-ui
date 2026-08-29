import { apiClient } from '../api/client';
import { getAppConfig } from '../config';

export interface ResolveMediaOptions {
  download?: boolean;
  tenant?: string;
}

/**
 * resolveMediaUrl converts an upload ID (e.g. "grns/invoice_123.pdf" or "products/pic.png"),
 * a relative API media path, or an absolute URL into a browser-loadable media URL.
 *
 * It hits the dedicated media resolver endpoint `/api/v1/media/file/*upload_id` where the
 * backend automatically resolves tenant context safely without client-side string splicing.
 */
export function resolveMediaUrl(uploadIdOrUrl: string, options?: ResolveMediaOptions): string {
  if (!uploadIdOrUrl) return '';

  const trimmed = uploadIdOrUrl.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Determine the best backend base URL
  const config = getAppConfig();
  const rawBase =
    apiClient.defaults.baseURL ||
    config?.apiBaseUrl ||
    (typeof window !== 'undefined' ? (window as any)?.runtimeConfig?.apiBaseUrl : '') ||
    '/api/v1';
  const cleanBase = rawBase.replace(/\/+$/, '');

  let origin = '';
  if (cleanBase.startsWith('http://') || cleanBase.startsWith('https://')) {
    try {
      origin = new URL(cleanBase).origin;
    } catch {
      origin = '';
    }
  }

  // Extract query parameters
  const queryParts: string[] = [];
  if (options?.download) {
    queryParts.push('download=true');
  }
  if (options?.tenant) {
    queryParts.push(`tenant=${encodeURIComponent(options.tenant)}`);
  }
  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  // Extract bare upload ID if wrapped in relative path prefixes
  let uploadId = trimmed.replace(/^\/+/, '');
  if (uploadId.startsWith('api/v1/media/file/')) {
    uploadId = uploadId.slice('api/v1/media/file/'.length);
  } else if (uploadId.startsWith('media/file/')) {
    uploadId = uploadId.slice('media/file/'.length);
  } else if (uploadId.startsWith('api/v1/media/')) {
    const parts = uploadId.slice('api/v1/media/'.length).split('/');
    // If format is tenant/bucket/key (3 or more parts), strip tenant to get bucket/key
    if (parts.length >= 3) {
      uploadId = parts.slice(1).join('/');
    } else {
      uploadId = parts.join('/');
    }
  } else if (uploadId.startsWith('media/')) {
    const parts = uploadId.slice('media/'.length).split('/');
    if (parts.length >= 3) {
      uploadId = parts.slice(1).join('/');
    } else {
      uploadId = parts.join('/');
    }
  }

  uploadId = uploadId.replace(/^\/+/, '');

  // If cleanBase has an origin (e.g. https://erpapi-staging.geeksman.co.in/api/v1)
  if (origin) {
    const pathPrefix = cleanBase.slice(origin.length) || '/api/v1';
    return `${origin}${pathPrefix}/media/file/${uploadId}${queryString}`;
  }

  // Fallback when running relative without absolute host
  return `${cleanBase}/media/file/${uploadId}${queryString}`;
}
