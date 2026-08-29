import { apiClient } from '../api/client';

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

  const baseURL = apiClient.defaults.baseURL || '/api/v1';
  const cleanBase = baseURL.replace(/\/+$/, '');

  // Extract query parameters
  const queryParts: string[] = [];
  if (options?.download) {
    queryParts.push('download=true');
  }
  if (options?.tenant) {
    queryParts.push(`tenant=${encodeURIComponent(options.tenant)}`);
  }
  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  // If already prefixed with /api/v1/media/file/ or /media/file/
  if (trimmed.startsWith('/api/v1/media/file/')) {
    if (cleanBase.startsWith('http://') || cleanBase.startsWith('https://')) {
      try {
        const origin = new URL(cleanBase).origin;
        return `${origin}${trimmed}${queryString}`;
      } catch {
        return `${trimmed}${queryString}`;
      }
    }
    return `${trimmed}${queryString}`;
  }

  if (trimmed.startsWith('/media/file/')) {
    return `${cleanBase}${trimmed}${queryString}`;
  }

  // If it's a legacy route like /api/v1/media/:tenant/:bucket/:key
  if (trimmed.startsWith('/api/v1/media/') || trimmed.startsWith('/media/')) {
    if (cleanBase.startsWith('http://') || cleanBase.startsWith('https://')) {
      try {
        const origin = new URL(cleanBase).origin;
        const normalized = trimmed.startsWith('/api/v1') ? trimmed : `/api/v1${trimmed}`;
        return `${origin}${normalized}${queryString}`;
      } catch {
        return `${trimmed}${queryString}`;
      }
    }
    return `${trimmed}${queryString}`;
  }

  // Bare upload ID (e.g. "grns/invoice_123.png" or "products/item.jpg")
  const cleanUploadId = trimmed.replace(/^\/+/, '');
  return `${cleanBase}/media/file/${cleanUploadId}${queryString}`;
}
