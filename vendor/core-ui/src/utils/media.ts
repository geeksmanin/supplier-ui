import { apiClient, getBaseUrl, getWorkspaceFromUrl } from '../api/client';
import { getAppConfig } from '../config';

export interface ResolveMediaOptions {
  download?: boolean;
  tenant?: string;
}

/**
 * resolveMediaUrl converts an upload ID (e.g. "product-images/pic.png"),
 * a relative API media path, or an absolute URL into a browser-loadable media URL
 * dynamically anchored to the active backend API server origin.
 */
export function resolveMediaUrl(uploadIdOrUrl: string, options?: ResolveMediaOptions): string {
  if (!uploadIdOrUrl) return '';

  const trimmed = uploadIdOrUrl.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Extract query parameters and clean raw path
  const [basePath, existingQuery] = trimmed.split('?');
  const existingParams = new URLSearchParams(existingQuery || '');

  // If it's an external URL (not pointing to our media server), return as-is
  if (
    (basePath.startsWith('http://') || basePath.startsWith('https://')) &&
    !basePath.includes('/media/') &&
    !basePath.includes('/media/file/')
  ) {
    return trimmed;
  }

  // Determine the active backend base URL
  const config = getAppConfig();
  const rawBase =
    apiClient.defaults.baseURL ||
    getBaseUrl() ||
    config?.apiBaseUrl ||
    (typeof window !== 'undefined' ? (window as any)?.runtimeConfig?.apiBaseUrl : '') ||
    '/api/v1';
  const cleanBase = (rawBase || '/api/v1').replace(/\/+$/, '');

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

  // Extract bare upload ID from path (strip origin, /api/v1, /media/file, tenant prefix if direct)
  let uploadId = basePath;
  if (uploadId.startsWith('http://') || uploadId.startsWith('https://')) {
    try {
      const parsed = new URL(uploadId);
      uploadId = parsed.pathname;
    } catch {
      // fallback
    }
  }

  uploadId = uploadId.replace(/^\/+/, '');
  if (uploadId.startsWith('api/v1/media/file/')) {
    uploadId = uploadId.slice('api/v1/media/file/'.length);
  } else if (uploadId.startsWith('media/file/')) {
    uploadId = uploadId.slice('media/file/'.length);
  } else if (uploadId.startsWith('api/v1/media/')) {
    const parts = uploadId.slice('api/v1/media/'.length).split('/');
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

  if (cleanBase.endsWith('/api/v1')) {
    return `${cleanBase}/media/file/${uploadId}${queryString}`;
  }
  if (cleanBase.startsWith('http://') || cleanBase.startsWith('https://')) {
    return `${cleanBase}/api/v1/media/file/${uploadId}${queryString}`;
  }
  if (cleanBase === '' || cleanBase === '/') {
    return `/api/v1/media/file/${uploadId}${queryString}`;
  }

  return `${cleanBase}/media/file/${uploadId}${queryString}`;
}

/**
 * toRelativeMediaUrl normalizes any media URL or upload ID to a consistent relative API path
 * (e.g. "/api/v1/media/file/samwad/photo.png"). Absolute origins (http://...) are stripped so that
 * all URLs persisted to databases and payloads remain clean, environment-agnostic paths.
 */
export function toRelativeMediaUrl(urlOrId: string): string {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Extract query parameters and path
  const [basePath, searchPart] = trimmed.split('?');
  let uploadId = basePath;
  if (uploadId.startsWith('http://') || uploadId.startsWith('https://')) {
    try {
      const parsed = new URL(uploadId);
      uploadId = parsed.pathname;
    } catch {
      // fallback
    }
  }

  uploadId = uploadId.replace(/^\/+/, '');
  if (uploadId.startsWith('api/v1/media/file/')) {
    uploadId = uploadId.slice('api/v1/media/file/'.length);
  } else if (uploadId.startsWith('media/file/')) {
    uploadId = uploadId.slice('media/file/'.length);
  } else if (uploadId.startsWith('api/v1/media/')) {
    const parts = uploadId.slice('api/v1/media/'.length).split('/');
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

  const queryString = searchPart ? `?${searchPart}` : '';
  return `/api/v1/media/file/${uploadId}${queryString}`;
}

/**
 * uploadMediaFile uploads a File to the central Core media service (/media/upload).
 * Returns the RELATIVE media path (e.g. /api/v1/media/file/samwad/photo.png) so database records
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
    const rawUrl = d?.upload_id || d?.uploadId || d?.relative_url || d?.media_url || d?.url;
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

