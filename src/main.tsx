import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { registerCustomerPortalModule } from './register';
import './index.css';
import { initializeConfig, resolveTenantCodeFromServer, apiClient } from '@geeksman/core-ui';
import { getAppConfig } from './config';

// Initialize configuration
initializeConfig(getAppConfig());

registerCustomerPortalModule();

const applyDynamicBranding = async (target: 'staff' | 'customer') => {
  if (typeof window === 'undefined') return;

  const config = getAppConfig();
  const backendBase = config.apiBaseUrl || 'https://erpapi.geeksman.co.in';
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

  const host = window.location.host;
  let workspace = 'platform';
  if (host !== 'localhost' && host !== '127.0.0.1') {
    const parts = host.split('.');
    if (parts.length > 1 && parts[0] !== 'admin' && parts[0] !== 'platform' && parts[0] !== 'www') {
      workspace = parts[0];
    }
  }

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
      // The backend serves a fully branded manifest per subdomain (name, short_name, icons)
      // as a proper absolute URL — satisfying Chrome's PWA installability check.
      const manifestApiUrl = `${backendBase}/tenant/manifest?portal=customer${workspace !== 'platform' ? `&workspace=${workspace}` : ''}`;
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

// Resolve tenant code from server before mounting application
resolveTenantCodeFromServer().then(async () => {
  await applyDynamicBranding('customer');
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}).catch((err) => {
  console.error('Failed to bootstrap application:', err);
  // Mount anyway so the user sees a UI
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
