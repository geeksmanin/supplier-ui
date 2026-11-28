import { useState, useEffect } from 'react';
import { getWorkspaceFromUrl } from '@geeksman/core-ui';
import { fetchTenantResolution } from './hooks/usePortalSettings';

export interface DynamicBrandingOptions {
  target: 'staff' | 'customer';
  apiBaseUrl?: string;
}

export interface TenantBranding {
  appName: string;
  logoUrl: string;
  faviconUrl: string;
  loading: boolean;
}

export const applyDynamicBranding = async (
  targetOrOptions: 'staff' | 'customer' | DynamicBrandingOptions = 'customer'
) => {
  if (typeof window === 'undefined') return;

  const target = typeof targetOrOptions === 'string' ? targetOrOptions : targetOrOptions.target;
  let backendBase = typeof targetOrOptions === 'object' && targetOrOptions.apiBaseUrl ? targetOrOptions.apiBaseUrl : '';

  if (!backendBase) {
    try {
      const globalConfig = (window as any)?.__APP_CONFIG__;
      backendBase = globalConfig?.apiBaseUrl || '';
    } catch {
      // fallback
    }
  }

  if (!backendBase) {
    backendBase = 'https://erpapi.geeksman.co.in';
  }

  let backendHost = '';
  if (backendBase.startsWith('http://') || backendBase.startsWith('https://')) {
    backendHost = backendBase.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
  }

  const getAbsoluteLogoUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `${backendHost}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const host = window.location.host;
  const isCustomHost = !!host && !host.includes('localhost') && !host.includes('127.0.0.1');
  const storedTenant = typeof window !== 'undefined'
    ? (localStorage.getItem('tenant_code') || localStorage.getItem('workspace_code') || getWorkspaceFromUrl())
    : getWorkspaceFromUrl();

  try {
    let info: any = null;
    try {
      info = await fetchTenantResolution(
        isCustomHost ? { host } : (storedTenant && storedTenant !== 'platform' ? { code: storedTenant } : { host })
      );
    } catch {
      // Ignored if resolution fails, falls back to default assets
    }
    if (info) {
      if (info.tenant_code) {
        localStorage.setItem('tenant_code', info.tenant_code);
        localStorage.setItem('workspace_code', info.workspace || info.tenant_code);
      }
      if (info.name) {
        localStorage.setItem('tenant_name', info.name);
      }
      const appName = target === 'staff'
        ? (info.staff_app_name || 'Staff Portal')
        : (info.customer_app_name || 'Customer Portal');
      const logoUrl = getAbsoluteLogoUrl(target === 'staff' ? info.staff_logo_url : info.customer_logo_url);
      const faviconUrl = info.favicon_url ? getAbsoluteLogoUrl(info.favicon_url) : '/favicon.png';

      document.title = appName;

      // Update favicon
      let faviconLink: any =
        document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = faviconUrl;

      // Update apple-touch-icon for iOS
      let appleTouchIcon: any = document.querySelector('link[rel="apple-touch-icon"]');
      if (!appleTouchIcon) {
        appleTouchIcon = document.createElement('link');
        appleTouchIcon.rel = 'apple-touch-icon';
        document.head.appendChild(appleTouchIcon);
      }
      if (logoUrl) appleTouchIcon.href = logoUrl;

      // Point the manifest link at the backend dynamic manifest endpoint
      const manifestWs = info.workspace || storedTenant || 'platform';
      const manifestApiUrl = `${backendBase}/tenant/manifest?portal=${target}${
        manifestWs !== 'platform' ? `&workspace=${manifestWs}` : ''
      }`;
      let link = document.querySelector('link[rel="manifest"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'manifest');
        document.head.appendChild(link);
      }
      link.setAttribute('href', manifestApiUrl);
      link.setAttribute('crossorigin', 'use-credentials');

      if (logoUrl) localStorage.setItem('branding_logo', logoUrl);
      if (appName) localStorage.setItem('branding_name', appName);

      window.dispatchEvent(
        new CustomEvent('tenant_branding_updated', {
          detail: { appName, logoUrl, faviconUrl }
        })
      );
    }
  } catch (err) {
    console.warn('[TenantBranding] Failed to apply dynamic branding:', err);
  }
};

export const useTenantBranding = (fallbackName = 'GEEKSMAN OS', fallbackLogo = '/geeksman_logo.png'): TenantBranding => {
  const [branding, setBranding] = useState<TenantBranding>(() => {
    const logo = (typeof window !== 'undefined' ? localStorage.getItem('branding_logo') : null) || fallbackLogo;
    const name = (typeof window !== 'undefined' ? localStorage.getItem('branding_name') : null) || fallbackName;
    return {
      appName: name,
      logoUrl: logo,
      faviconUrl: '/favicon.png',
      loading: false,
    };
  });

  useEffect(() => {
    const handler = (e: any) => {
      if (e?.detail) {
        setBranding({
          appName: e.detail.appName || fallbackName,
          logoUrl: e.detail.logoUrl || fallbackLogo,
          faviconUrl: e.detail.faviconUrl || '/favicon.png',
          loading: false,
        });
      }
    };
    window.addEventListener('tenant_branding_updated', handler);
    return () => window.removeEventListener('tenant_branding_updated', handler);
  }, [fallbackName, fallbackLogo]);

  return branding;
};

