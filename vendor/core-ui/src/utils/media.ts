import { apiClient, getWorkspaceFromUrl } from '../api/client';
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
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Extract query parameters and clean raw path
  const [basePath, existingQuery] = trimmed.split('?');
  const existingParams = new URLSearchParams(existingQuery || '');

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
  if (options?.download || existingParams.get('download') === 'true') {
    queryParts.push('download=true');
  }

  const activeTenant =
    options?.tenant ||
    existingParams.get('tenant') ||
    existingParams.get('tenant_code') ||
    getWorkspaceFromUrl() ||
    config?.tenantCode ||
    'platform';

  if (activeTenant) {
    queryParts.push(`tenant=${encodeURIComponent(activeTenant)}`);
  }
  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  if (basePath.startsWith('http://') || basePath.startsWith('https://')) {
    // If it's already an absolute URL hitting our media endpoint, ensure tenant is attached
    if (basePath.includes('/media/file/')) {
      return `${basePath}${queryString}`;
    }
    return trimmed;
  }

  // Extract bare upload ID if wrapped in relative path prefixes
  let uploadId = basePath.replace(/^\/+/, '');
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

/**
 * toRelativeMediaUrl normalizes any media URL or upload ID to a consistent relative API path
 * (e.g. "/media/file/samwad/photo.png"). Absolute origins (http://...) are stripped so that
 * all URLs persisted to databases and payloads remain clean, relative paths.
 */
export function toRelativeMediaUrl(urlOrId: string): string {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // If it's an absolute URL, strip the origin
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      let path = parsed.pathname;
      if (path.startsWith('/api/v1/')) {
        path = path.slice(7);
      }
      return `${path}${parsed.search}`;
    } catch {
      return trimmed;
    }
  }

  // If already starts with /
  if (trimmed.startsWith('/')) {
    const [pathPart, searchPart] = trimmed.split('?');
    let path = pathPart;
    if (path.startsWith('/api/v1/')) {
      path = path.slice(7);
    }
    return searchPart ? `${path}?${searchPart}` : path;
  }

  // If raw upload ID (e.g. "samwad/photo.png")
  return `/media/file/${trimmed}`;
}

/**
 * uploadMediaFile uploads a File to the central Core media service (/media/upload).
 * Returns the RELATIVE media path (e.g. /media/file/samwad/photo.png) so database records
 * store relative paths. Use resolveMediaUrl / useMedia on the frontend to resolve for display.
 */
export async function uploadMediaFile(file: File, folder: string = 'samwad'): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', folder);

    const res = await apiClient.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const d = res.data?.data || res.data;
    const rawUrl = d?.relative_url || d?.upload_id || d?.uploadId || d?.media_url || d?.url;
    if (rawUrl) {
      return toRelativeMediaUrl(String(rawUrl));
    }
  } catch (err) {
    console.warn('Core media upload error, using local file URL fallback:', err);
  }

  // Fallback: Read file as Data URL
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

