import { apiClient, getBaseUrl, getWorkspaceFromUrl } from '../api/client';
import { getAppConfig } from '../config';
import { getCurrentUser } from './auth';

export interface ResolveMediaOptions {
  download?: boolean;
  tenant?: string;
}

/**
 * getActiveTenant extracts the active workspace/tenant code from options, URL, or localStorage.
 * No hardcoded fallbacks like "platform".
 */
export function getActiveTenant(optionsTenant?: string): string {
  // 1. Explicit options (if passed and valid)
  if (optionsTenant && optionsTenant !== 'business') {
    return optionsTenant.trim();
  }

  // 2. localStorage is primary source of truth
  if (typeof window !== 'undefined') {
    const saved =
      localStorage.getItem('tenant_code') ||
      localStorage.getItem('workspace_code') ||
      localStorage.getItem('current_tenant_code');
    if (saved && saved !== 'business') {
      return saved.trim();
    }
  }

  // 3. Fallback: heal from active JWT token claims
  try {
    const user = getCurrentUser();
    if (user?.tenantCode && user.tenantCode !== 'business') {
      return user.tenantCode.trim();
    }
  } catch {}

  // 4. Subdomain / URL workspace
  const fromUrl = getWorkspaceFromUrl();
  if (fromUrl && fromUrl !== 'business') {
    return fromUrl.trim();
  }

  // 5. AppConfig default (if valid)
  const config = getAppConfig();
  if (config?.tenantCode && config.tenantCode !== 'business') {
    return config.tenantCode.trim();
  }
  if (config?.defaultTenant && config.defaultTenant !== 'business') {
    return config.defaultTenant.trim();
  }

  return ''; // Never fallback to 'platform'
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

  // Detect whether this is an external third-party URL vs an internal Geeksman/Core media URL
  if (basePath.startsWith('http://') || basePath.startsWith('https://')) {
    let isInternalMedia = false;
    try {
      const parsed = new URL(basePath);
      const host = parsed.hostname.toLowerCase();
      const isLoopback =
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '10.0.2.2' ||
        host.endsWith('.local') ||
        /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
      const isGeeksmanHost = host.includes('geeksman.') || host.includes('samwad.') || host.includes('samvad.');
      const isMediaEndpoint =
        parsed.pathname.includes('/media/') ||
        parsed.pathname.includes('/samwad') ||
        parsed.pathname.includes('/samvad') ||
        parsed.pathname.includes('/media/file/');

      if (isLoopback || isGeeksmanHost || isMediaEndpoint) {
        isInternalMedia = true;
      }
    } catch {
      // invalid URL
    }

    if (!isInternalMedia) {
      return trimmed;
    }
  }

  // Determine the active backend base URL directly from config
  const config = getAppConfig();
  const rawBase =
    config?.apiBaseUrl ||
    apiClient.defaults.baseURL ||
    getBaseUrl() ||
    (typeof window !== 'undefined' ? (window as any)?.runtimeConfig?.apiBaseUrl : '') ||
    '/api/v1';

  const cleanBase = (rawBase || '/api/v1').replace(/\/+$/, '');
  const downloadQuery = (options?.download || existingParams.get('download') === 'true') ? '?download=true' : '';

  const activeTenant =
    (options?.tenant && options.tenant !== 'business' ? options.tenant : undefined) ||
    (existingParams.get('tenant') && existingParams.get('tenant') !== 'business' ? existingParams.get('tenant') : undefined) ||
    (existingParams.get('tenant_code') && existingParams.get('tenant_code') !== 'business' ? existingParams.get('tenant_code') : undefined) ||
    getActiveTenant();

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
  let resolvedTenant = activeTenant;
  if (uploadId.startsWith('api/v1/media/file/')) {
    uploadId = uploadId.slice('api/v1/media/file/'.length);
  } else if (uploadId.startsWith('media/file/')) {
    uploadId = uploadId.slice('media/file/'.length);
  } else if (uploadId.startsWith('api/v1/media/')) {
    const parts = uploadId.slice('api/v1/media/'.length).split('/');
    if (parts.length >= 3) {
      if (parts[0] && parts[0] !== 'business' && parts[0] !== 'file') {
        resolvedTenant = parts[0];
      } else {
        resolvedTenant = activeTenant;
      }
      uploadId = parts.slice(1).join('/');
    } else {
      uploadId = parts.join('/');
    }
  } else if (uploadId.startsWith('media/')) {
    const parts = uploadId.slice('media/'.length).split('/');
    if (parts.length >= 3) {
      if (parts[0] && parts[0] !== 'business' && parts[0] !== 'file') {
        resolvedTenant = parts[0];
      } else {
        resolvedTenant = activeTenant;
      }
      uploadId = parts.slice(1).join('/');
    } else {
      uploadId = parts.join('/');
    }
  } else if (uploadId.startsWith('api/v1/')) {
    uploadId = uploadId.slice('api/v1/'.length);
  }
  uploadId = uploadId.replace(/^\/+/, '');

  if (resolvedTenant && uploadId.startsWith(`${resolvedTenant}/`)) {
    uploadId = uploadId.slice(resolvedTenant.length + 1);
  }
  if (uploadId.startsWith('business/')) {
    uploadId = uploadId.slice('business/'.length);
  }

  if (!resolvedTenant || resolvedTenant === 'business') {
    resolvedTenant = activeTenant;
  }

  // Ensure uploadId has a bucket segment when routing to /media/:tenant/:bucket/*key
  // Single-part filenames default to bucket "general" (matching core HandleUploadMedia)
  const normalizedUploadId = uploadId.includes('/') ? uploadId : `general/${uploadId}`;

  const prefix = cleanBase.endsWith('/api/v1')
    ? `${cleanBase}/media`
    : cleanBase.startsWith('http://') || cleanBase.startsWith('https://')
    ? `${cleanBase}/api/v1/media`
    : `/api/v1/media`;

  if (resolvedTenant && resolvedTenant !== 'business') {
    return `${prefix}/${resolvedTenant}/${normalizedUploadId}${downloadQuery}`;
  }

  return `${cleanBase}/media/file/${uploadId}${downloadQuery}`;
}

/**
 * toRelativeMediaUrl normalizes any media URL or upload ID to a consistent relative API path.
 */
export function toRelativeMediaUrl(urlOrId: string, tenant?: string): string {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Extract query parameters and path
  const [basePath, searchPart] = trimmed.split('?');
  const existingParams = new URLSearchParams(searchPart || '');
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
  let activeTenant =
    (tenant && tenant !== 'business' ? tenant : undefined) ||
    (existingParams.get('tenant') && existingParams.get('tenant') !== 'business' ? existingParams.get('tenant') : undefined) ||
    (existingParams.get('tenant_code') && existingParams.get('tenant_code') !== 'business' ? existingParams.get('tenant_code') : undefined) ||
    getActiveTenant();

  if (uploadId.startsWith('api/v1/media/file/')) {
    uploadId = uploadId.slice('api/v1/media/file/'.length);
  } else if (uploadId.startsWith('media/file/')) {
    uploadId = uploadId.slice('media/file/'.length);
  } else if (uploadId.startsWith('api/v1/media/')) {
    const parts = uploadId.slice('api/v1/media/'.length).split('/');
    if (parts.length >= 3) {
      if (parts[0] && parts[0] !== 'business' && parts[0] !== 'file') {
        activeTenant = parts[0];
      }
      uploadId = parts.slice(1).join('/');
    } else {
      uploadId = parts.join('/');
    }
  } else if (uploadId.startsWith('media/')) {
    const parts = uploadId.slice('media/'.length).split('/');
    if (parts.length >= 3) {
      if (parts[0] && parts[0] !== 'business' && parts[0] !== 'file') {
        activeTenant = parts[0];
      }
      uploadId = parts.slice(1).join('/');
    } else {
      uploadId = parts.join('/');
    }
  } else if (uploadId.startsWith('api/v1/')) {
    uploadId = uploadId.slice('api/v1/'.length);
  }
  uploadId = uploadId.replace(/^\/+/, '');

  if (activeTenant && uploadId.startsWith(`${activeTenant}/`)) {
    uploadId = uploadId.slice(activeTenant.length + 1);
  }
  if (uploadId.startsWith('business/')) {
    uploadId = uploadId.slice('business/'.length);
  }

  if (!activeTenant || activeTenant === 'business') {
    activeTenant = getActiveTenant();
  }

  const downloadQuery = (searchPart && searchPart.includes('download=true')) ? '?download=true' : '';
  const normalizedUploadId = uploadId.includes('/') ? uploadId : `general/${uploadId}`;
  if (activeTenant && activeTenant !== 'business') {
    return `/api/v1/media/${activeTenant}/${normalizedUploadId}${downloadQuery}`;
  }
  return `/api/v1/media/file/${uploadId}${downloadQuery}`;
}

/**
 * uploadMediaFile uploads a File to the central Core media service (/media/upload).
 * Returns the canonical upload_id so database records store pure IDs without hardcoded prefixes.
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
