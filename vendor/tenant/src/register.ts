import React from 'react';
import { UIRegistry, Dashboard3DIcon, Settings3DIcon, Tenant3DIcon, Branch3DIcon, Portals3DIcon } from '@geeksman/core-ui';
import { Dashboard } from './components/Dashboard/Dashboard';
import { TenantSetup } from './components/TenantSetup/TenantSetup';
import { Profile } from './components/Profile/Profile';
import { ExportsHistory } from './components/Exports/ExportsHistory';
import { BranchesList } from './components/BranchSetup/BranchesList';
import { BranchFormPage } from './components/BranchSetup/BranchFormPage';
import { PortalManagement } from './components/PortalManagement/PortalManagement';

const isPlatformAdminUser = () => {
  const token = localStorage.getItem('token') || '';
  if (!token) return false;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    const roles = decoded?.roles || [];
    const loggedTenantCode = localStorage.getItem('portal_tenant_code') || localStorage.getItem('tenant_code') || '';
    const isPlatform = loggedTenantCode === 'platform' || loggedTenantCode === 'default';
    const hasRole = roles.includes('admin') || roles.includes('platform-admin');
    return isPlatform && hasRole;
  } catch (e) {
    return false;
  }
};

export function registerTenantModule(options?: {
  enableTenantOnboarding?: boolean;
  enableFullTenantSettings?: boolean;
  enableBranches?: boolean;
}) {
  const enableTenantOnboarding = options?.enableTenantOnboarding ?? true;
  const enableFullTenantSettings = options?.enableFullTenantSettings ?? true;
  const enableBranches = options?.enableBranches ?? false;

  // 1. Register main routes
  UIRegistry.registerRoute({
    path: '/dashboard',
    element: React.createElement(Dashboard, { tab: 'dashboard' }),
    isProtected: true
  });

  UIRegistry.registerRoute({
    path: '/settings/profile',
    element: React.createElement(Profile),
    isProtected: true
  });

  if (enableFullTenantSettings) {
    UIRegistry.registerRoute({
      path: '/settings/workspace',
      element: React.createElement(Dashboard, { tab: 'tenant' }),
      isProtected: true
    });
  }

  if (enableTenantOnboarding) {
    UIRegistry.registerRoute({
      path: '/settings/tenants',
      element: React.createElement(Dashboard, { tab: 'super_tenants' }),
      isProtected: true
    });
  }

  if (enableFullTenantSettings) {
    UIRegistry.registerRoute({
      path: '/settings/users',
      element: React.createElement(Dashboard, { tab: 'users' }),
      isProtected: true
    });

    UIRegistry.registerRoute({
      path: '/settings/roles',
      element: React.createElement(Dashboard, { tab: 'roles' }),
      isProtected: true
    });

    UIRegistry.registerRoute({
      path: '/settings/shortcuts',
      element: React.createElement(Dashboard, { tab: 'shortcuts' }),
      isProtected: true
    });

    UIRegistry.registerRoute({
      path: '/settings/exports',
      element: React.createElement(ExportsHistory),
      isProtected: true
    });

    UIRegistry.registerRoute({
      path: '/settings/portals',
      element: React.createElement(PortalManagement),
      isProtected: true
    });

    UIRegistry.registerRoute({
      path: '/settings/portals/:portalCode',
      element: React.createElement(PortalManagement),
      isProtected: true
    });

  }

  if (enableTenantOnboarding) {
    UIRegistry.registerRoute({
      path: '/tenant-setup',
      element: React.createElement(TenantSetup),
      isProtected: true
    });
  }

  // 2. Register Navigation Items
  // Main Navigation Group
  UIRegistry.registerNavItem({
    id: 'tenant-dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: React.createElement(Dashboard3DIcon),
    section: 'main',
    bgGradient: 'transparent',
    iconColor: '#ffffff'
  });

  UIRegistry.registerNavItem({
    id: 'tenant-settings',
    label: 'Settings',
    path: enableFullTenantSettings ? '/settings/workspace' : '/settings/profile', // Default click target
    icon: React.createElement(Settings3DIcon),
    section: 'main',
    bgGradient: 'transparent',
    sublabel: 'System Config',
    iconColor: '#ffffff'
  });

  // Extended Sub-navigation (links to tenant-settings parentId)
  if (enableFullTenantSettings) {
    UIRegistry.registerNavItem({
      id: 'tenant-workspace-config',
      label: 'Workspace Details',
      path: '/settings/workspace',
      icon: React.createElement('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
        React.createElement('rect', { x: '4', y: '2', width: '16', height: '20', rx: '2', ry: '2' }),
        React.createElement('line', { x1: '9', y1: '22', x2: '9', y2: '16' }),
        React.createElement('line', { x1: '15', y1: '22', x2: '15', y2: '16' }),
        React.createElement('line', { x1: '9', y1: '16', x2: '15', y2: '16' }),
        React.createElement('path', { d: 'M8 6h.01' }),
        React.createElement('path', { d: 'M16 6h.01' }),
        React.createElement('path', { d: 'M8 10h.01' }),
        React.createElement('path', { d: 'M16 10h.01' })
      ),
      section: 'extended',
      parentId: 'tenant-settings'
    });
  }

  if (enableTenantOnboarding) {
    UIRegistry.registerNavItem({
      id: 'tenant-management',
      label: 'Tenant Management',
      path: '/settings/tenants',
      icon: React.createElement('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
        React.createElement('rect', { x: '2', y: '3', width: '20', height: '14', rx: '2', ry: '2' }),
        React.createElement('line', { x1: '2', y1: '10', x2: '22', y2: '10' })
      ),
      section: 'extended',
      parentId: 'tenant-settings',
      visible: isPlatformAdminUser
    });
  }

  if (enableFullTenantSettings) {
    UIRegistry.registerNavItem({
      id: 'tenant-users-config',
      label: 'User Settings',
      path: '/settings/users',
      icon: React.createElement('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
        React.createElement('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
        React.createElement('circle', { cx: '9', cy: '7', r: '4' }),
        React.createElement('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
        React.createElement('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
      ),
      section: 'extended',
      parentId: 'tenant-settings'
    });

    UIRegistry.registerNavItem({
      id: 'tenant-roles-config',
      label: 'Role Settings',
      path: '/settings/roles',
      icon: React.createElement('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
        React.createElement('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' })
      ),
      section: 'extended',
      parentId: 'tenant-settings'
    });

    UIRegistry.registerNavItem({
      id: 'tenant-shortcuts-config',
      label: 'Keyboard Shortcuts',
      path: '/settings/shortcuts',
      icon: React.createElement('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
        React.createElement('rect', { x: '2', y: '4', width: '20', height: '16', rx: '2', ry: '2' }),
        React.createElement('line', { x1: '6', y1: '8', x2: '6', y2: '8' }),
        React.createElement('line', { x1: '10', y1: '8', x2: '10', y2: '8' }),
        React.createElement('line', { x1: '14', y1: '8', x2: '14', y2: '8' }),
        React.createElement('line', { x1: '18', y1: '8', x2: '18', y2: '8' }),
        React.createElement('line', { x1: '6', y1: '12', x2: '6', y2: '12' }),
        React.createElement('line', { x1: '10', y1: '12', x2: '10', y2: '12' }),
        React.createElement('line', { x1: '14', y1: '12', x2: '14', y2: '12' }),
        React.createElement('line', { x1: '18', y1: '12', x2: '18', y2: '12' }),
        React.createElement('line', { x1: '7', y1: '16', x2: '17', y2: '16' })
      ),
      section: 'extended',
      parentId: 'tenant-settings'
    });

    UIRegistry.registerNavItem({
      id: 'tenant-exports-config',
      label: 'Exports History',
      path: '/settings/exports',
      icon: React.createElement('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
        React.createElement('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
        React.createElement('polyline', { points: '7 10 12 15 17 10' }),
        React.createElement('line', { x1: '12', y1: '15', x2: '12', y2: '3' })
      ),
      section: 'extended',
      parentId: 'tenant-settings'
    });

    UIRegistry.registerNavItem({
      id: 'tenant-portals-config',
      label: 'Portals Management',
      path: '/settings/portals',
      icon: React.createElement(Portals3DIcon, { size: 18 }),
      section: 'extended',
      parentId: 'tenant-settings'
    });

    UIRegistry.registerNavItem({
      id: 'portals-main',
      label: 'Portals',
      path: '/settings/portals',
      icon: React.createElement(Portals3DIcon),
      section: 'main',
      bgGradient: 'transparent',
      sublabel: 'Portals & Routing Config',
      iconColor: '#ffffff'
    });
  }

  if (enableTenantOnboarding) {
    UIRegistry.registerNavItem({
      id: 'tenant-onboarding',
      label: 'Onboard Tenant',
      path: '/tenant-setup',
      icon: React.createElement(Tenant3DIcon),
      section: 'main',
      bgGradient: 'transparent',
      sublabel: 'Register Tenant',
      iconColor: '#ffffff',
      visible: isPlatformAdminUser
    });
  }

  // 3. Register Global Search Items
  if (enableFullTenantSettings) {
    UIRegistry.registerSearchItem({
      id: 'search-workspace-settings',
      title: 'Workspace Settings',
      description: 'Configure tenant name, contact email, and phone',
      category: 'Settings',
      keywords: ['tenant', 'domain', 'contact', 'email', 'profile'],
      action: (navigate) => navigate('/settings/workspace')
    });

    UIRegistry.registerSearchItem({
      id: 'search-user-management',
      title: 'User Management',
      description: 'Create, update and assign roles to tenant users',
      category: 'Settings',
      keywords: ['users', 'employees', 'member', 'admin', 'password'],
      action: (navigate) => navigate('/settings/users')
    });

    UIRegistry.registerSearchItem({
      id: 'search-role-management',
      title: 'Roles & Permissions',
      description: 'Configure access controls and security roles',
      category: 'Settings',
      keywords: ['roles', 'permissions', 'access', 'security', 'scopes'],
      action: (navigate) => navigate('/settings/roles')
    });

    UIRegistry.registerSearchItem({
      id: 'search-portals-management',
      title: 'Portals Management',
      description: 'Configure default landing pages, agents, and live settings for Customer, Samwad, and Supplier portals',
      category: 'Settings',
      keywords: ['portal', 'portals', 'customer', 'samwad', 'supplier', 'marketplace', 'landing page', 'default agent'],
      action: (navigate) => navigate('/settings/portals')
    });
  }

  if (enableTenantOnboarding) {
    UIRegistry.registerSearchItem({
      id: 'search-tenant-onboarding',
      title: 'Onboard Tenant',
      description: 'Register and set up a new isolated tenant workspace',
      category: 'Actions',
      keywords: ['onboard', 'register', 'tenant', 'setup', 'new tenant', 'create tenant'],
      action: (navigate) => navigate('/tenant-setup'),
      visible: isPlatformAdminUser
    });

    UIRegistry.registerSearchItem({
      id: 'search-tenant-management',
      title: 'Tenant Management',
      description: 'Manage registered tenants and workspaces',
      category: 'Settings',
      keywords: ['tenants', 'workspaces', 'super admin', 'list tenants'],
      action: (navigate) => navigate('/settings/tenants'),
      visible: isPlatformAdminUser
    });
  }

  UIRegistry.registerSearchItem({
    id: 'search-logout-action',
    title: 'Log out of Geeksman OS',
    description: 'Safely sign out of the current session',
    category: 'Actions',
    keywords: ['logout', 'signout', 'exit'],
    action: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user_email');
      localStorage.removeItem('tenant_code');
      window.location.href = '#/login';
    }
  });

  if (enableBranches) {
    registerBranchesModule();
  }
}

export function registerBranchesModule() {
  UIRegistry.registerRoute({
    path: '/settings/branches',
    element: React.createElement(BranchesList),
    isProtected: true
  });

  UIRegistry.registerRoute({
    path: '/settings/branches/new',
    element: React.createElement(BranchFormPage),
    isProtected: true
  });

  UIRegistry.registerRoute({
    path: '/settings/branches/:id',
    element: React.createElement(BranchFormPage),
    isProtected: true
  });

  UIRegistry.registerRoute({
    path: '/settings/branches/:id/edit',
    element: React.createElement(BranchFormPage),
    isProtected: true
  });

  UIRegistry.registerNavItem({
    id: 'branches-main',
    label: 'Branches',
    path: '/settings/branches',
    icon: React.createElement(Branch3DIcon),
    section: 'main',
    bgGradient: 'transparent',
    sublabel: 'Operating Branches & Depots',
    iconColor: '#ffffff'
  });

  UIRegistry.registerNavItem({
    id: 'tenant-branches-config',
    label: 'Branches',
    path: '/settings/branches',
    icon: React.createElement('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
      React.createElement('path', { d: 'M6 3v12' }),
      React.createElement('circle', { cx: '18', cy: '6', r: '3' }),
      React.createElement('circle', { cx: '6', cy: '18', r: '3' }),
      React.createElement('path', { d: 'M18 9a9 9 0 0 1-9 9' })
    ),
    section: 'extended',
    parentId: 'tenant-settings'
  });

  UIRegistry.registerSearchItem({
    id: 'tenant-branches-search',
    title: 'Branches',
    description: 'Manage operating branches, head office, and business codes',
    category: 'Settings',
    keywords: ['branch', 'branches', 'head office', 'operating branch', 'business unit', 'gstin'],
    action: (navigate) => navigate('/settings/branches')
  });

  UIRegistry.registerSearchItem({
    id: 'tenant-branches-create-search',
    title: '+ Create Branch',
    description: 'Add a new operating branch or regional office',
    category: 'Settings',
    keywords: ['new branch', 'create branch', 'add branch', 'branch setup'],
    action: (navigate) => navigate('/settings/branches/new')
  });
}
