import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { registerSupplierPortalModule } from './register';
import './index.css';
import { apiClient } from '@geeksman/core-ui';
import { getAppConfig } from './config';

// Initialize configuration
const config = getAppConfig();

registerSupplierPortalModule();

const applyDynamicBranding = async (target: 'staff' | 'customer') => {
  if (typeof window === 'undefined') return;

  const backendBase = config.apiBaseUrl;
  let backendHost = '';
  if (backendBase.startsWith('http://') || backendBase.startsWith('https://')) {
    backendHost = backendBase.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
  }

  const getAbsoluteLogoUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `${backendHost}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const workspace = config.tenantCode;

  try {
    const res = await apiClient.get(`/tenant/workspace`, {
      params: { workspace }
    });
    const info = res.data?.data;
    if (info) {
      const appName = target === 'staff' ? (info.staff_app_name || 'Staff Portal') : (info.customer_app_name || 'Customer Portal');
      const logoUrl = getAbsoluteLogoUrl(target === 'staff' ? info.staff_logo_url : info.customer_logo_url);
      const faviconUrl = info.favicon_url ? getAbsoluteLogoUrl(info.favicon_url) : '/favicon.png';

      document.title = appName;

      // Update favicon
      let faviconLink: any = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
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

      // Point the manifest link at the backend dynamic manifest endpoint.
      const manifestApiUrl = `${backendBase}/tenant/manifest?portal=customer${workspace ? `&workspace=${workspace}` : ''}`;
      let link = document.querySelector('link[rel="manifest"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'manifest');
        document.head.appendChild(link);
      }
      link.setAttribute('href', manifestApiUrl);
      link.setAttribute('crossorigin', 'use-credentials');

      localStorage.setItem('branding_logo', logoUrl);
      localStorage.setItem('branding_name', appName);
    }
  } catch (err) {
    console.warn('Failed to apply dynamic branding:', err);
  }
};

applyDynamicBranding('customer').finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
  );
});
