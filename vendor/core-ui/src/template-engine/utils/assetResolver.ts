/**
 * Utility to resolve static asset URLs (such as company logos and product thumbnails)
 * across web apps, sub-paths, and Capacitor mobile wrappers.
 */

export function resolveAssetUrl(assetPath: string, customBaseUrl?: string): string {
  if (!assetPath) return '';

  // Return base64 or absolute http/https URLs as is
  if (assetPath.startsWith('data:') || assetPath.startsWith('http://') || assetPath.startsWith('https://')) {
    return assetPath;
  }

  // Determine base path
  const base = customBaseUrl !== undefined
    ? customBaseUrl
    : (typeof window !== 'undefined' && (window as any).__BASE_PATH__) ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.BASE_URL) ||
      '/';

  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;

  return `${cleanBase}${cleanPath}`;
}
