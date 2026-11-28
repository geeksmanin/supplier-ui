import React, { useState, useEffect } from 'react';
import { useMediaQuery, apiClient, useRefreshOnVisible } from '@geeksman/core-ui';
import { DashboardDesktop } from './Dashboard.desktop';
import { DashboardMobile } from './Dashboard.mobile';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  employee_id: string;
  timezone: string;
  role_ids: string[];
  status: 'active' | 'inactive';
  created_at?: string;
  created_by?: { name?: string };
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  is_system_defined?: boolean;
}

export interface TenantInfo {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  workspace: string;
  service: string;
  app_name?: string;
  logo_url?: string;
  favicon_url?: string;
  staff_app_name?: string;
  staff_logo_url?: string;
  customer_app_name?: string;
  customer_logo_url?: string;
}

export interface DashboardProps {
  tab?: 'dashboard' | 'users' | 'roles' | 'tenant' | 'super_tenants' | 'shortcuts';
}

const parseJwt = (token: string) => {
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
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const Dashboard: React.FC<DashboardProps> = ({ tab }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const loggedTenantCode = localStorage.getItem('tenant_code') || '';
  const token = localStorage.getItem('token') || '';
  const decoded = parseJwt(token);
  const rolesClaim = decoded?.roles || [];
  const isPlatformAdmin = rolesClaim.includes('platform-admin');
  const isSuperAdmin = loggedTenantCode === 'platform' && isPlatformAdmin;

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'roles' | 'tenant' | 'super_tenants' | 'shortcuts'>(
    tab || 'dashboard'
  );

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);
  
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  
  // Super Admin tenant list state
  const [tenantsList, setTenantsList] = useState<TenantInfo[]>([]);

  // Search and Pagination states
  const [searchVal, setSearchVal] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Modals / forms state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allPermissions, setAllPermissions] = useState<Array<{ id: string; name: string; key: string }>>([]);

  // Fetch static data (roles, tenant, permissions) once on mount
  const fetchStaticData = async () => {
    setLoading(true);
    setError('');
    try {
      const rolesRes = await apiClient.get('/tenant/roles');
      if (rolesRes.data && rolesRes.data.data) {
        setRoles(rolesRes.data.data);
      }

      const tenantRes = await apiClient.get('/tenant?code=' + loggedTenantCode);
      if (tenantRes.data && tenantRes.data.data) {
        setTenantInfo(tenantRes.data.data);
      }

      const permissionsRes = await apiClient.get('/tenant/permissions');
      if (permissionsRes.data && permissionsRes.data.data) {
        setAllPermissions(permissionsRes.data.data.permissions || []);
      }

      if (isSuperAdmin) {
        const tenantsRes = await apiClient.get('/tenant/list');
        if (tenantsRes.data && tenantsRes.data.data) {
          setTenantsList(tenantsRes.data.data);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not fetch workspace parameters. Check API connection.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users list when search/pagination/filter/sort params change
  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: pageSize,
        search: searchVal
      };

      // Map column filters to backend parameters
      if (columnFilters.name) params.name = columnFilters.name;
      if (columnFilters.email) params.email = columnFilters.email;
      if (columnFilters.phone) params.phone = columnFilters.phone;
      if (columnFilters.employee_id) params.employee_id = columnFilters.employee_id;
      if (columnFilters.status) params.status = columnFilters.status;
      if (columnFilters.created_by) params.created_by = columnFilters.created_by;

      // Map sorting to backend parameters
      if (sortConfig) {
        params.sort_by = sortConfig.key;
        params.sort_order = sortConfig.direction;
      }

      const usersRes = await apiClient.get('/tenant/users', { params });
      if (usersRes.data && usersRes.data.data) {
        setUsers(usersRes.data.data.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          employee_id: u.employee_id,
          timezone: u.timezone,
          role_ids: u.roles ? u.roles.map((r: any) => r.id) : [],
          status: u.is_active ? 'active' : 'inactive',
          created_at: u.created_at,
          created_by: u.created_by,
        })));
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch user directory.');
    } finally {
      setLoading(false);
    }
  };

  // Load static data on mount
  useEffect(() => {
    fetchStaticData();
  }, []);

  // Update user list when query params change
  useEffect(() => {
    fetchUsersData();
  }, [currentPage, pageSize, searchVal, columnFilters, sortConfig]);

  // Refresh data and dropdowns when the browser tab regains visibility.
  // User-entered filters and form state are never touched here.
  useRefreshOnVisible(() => {
    fetchStaticData();
    fetchUsersData();
  });
  const handleUpdateTenant = async (
    updatedName: string,
    updatedPhone: string,
    updatedEmail: string,
    appName?: string,
    logoUrl?: string,
    faviconUrl?: string,
    staffAppName?: string,
    staffLogoUrl?: string,
    customerAppName?: string,
    customerLogoUrl?: string
  ) => {
    if (!tenantInfo) return;
    setLoading(true);
    try {
      const response = await apiClient.put(`/tenant/${tenantInfo.id}`, {
        name: updatedName,
        phone: updatedPhone,
        email: updatedEmail,
        app_name: appName,
        logo_url: logoUrl,
        favicon_url: faviconUrl,
        staff_app_name: staffAppName,
        staff_logo_url: staffLogoUrl,
        customer_app_name: customerAppName,
        customer_logo_url: customerLogoUrl,
      });
      if (response.data && response.data.data) {
        setTenantInfo(response.data.data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update tenant details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (userPayload: any) => {
    setLoading(true);
    try {
      if (editingUser) {
        const res = await apiClient.put(`/tenant/users/${editingUser.id}`, userPayload);
        const updated = res.data.data;
        setUsers(prev => prev.map(u => u.id === editingUser.id ? {
          ...u,
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          employee_id: updated.employee_id,
          timezone: updated.timezone,
          role_ids: updated.roles ? updated.roles.map((r: any) => r.id) : [],
        } : u));
      } else {
        const res = await apiClient.post('/tenant/users', userPayload);
        const created = res.data.data;
        const newUser: User = {
          id: created.id || `usr_${created.email || created.phone || Date.now()}`,
          name: created.name,
          email: created.email,
          phone: created.phone,
          employee_id: created.employee_id || '',
          timezone: created.timezone || 'UTC',
          role_ids: created.roles ? created.roles.map((r: any) => r.id) : [],
          status: 'active'
        };
        setUsers(prev => [...prev, newUser]);
      }
      setUserModalOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save user profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRole = async (rolePayload: any) => {
    setLoading(true);
    try {
      if (editingRole) {
        const res = await apiClient.put(`/tenant/roles/${editingRole.id}`, rolePayload);
        const updated = res.data.data;
        setRoles(prev => prev.map(r => r.id === editingRole.id ? {
          ...r,
          name: updated.name,
          permissions: updated.permissions || [],
        } : r));
      } else {
        const res = await apiClient.post('/tenant/roles', rolePayload);
        const created = res.data.data;
        setRoles(prev => [...prev, {
          id: created.id || `role_${created.name || Date.now()}`,
          name: created.name,
          permissions: created.permissions || [],
          is_system_defined: false
        }]);
      }
      setRoleModalOpen(false);
      setEditingRole(null);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save role definition.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    
    // Optimistic UI update
    setUsers(prev => prev.map(u => u.id === userId ? {
      ...u,
      status: newStatus
    } : u));

    try {
      await apiClient.put(`/tenant/users/${userId}`, {
        name: user.name,
        email: user.email,
        phone: user.phone,
        employee_id: user.employee_id,
        timezone: user.timezone || 'UTC',
        role_ids: user.role_ids,
        is_active: newStatus === 'active',
        is_all_subscriptions: true
      });
    } catch (err) {
      console.error('Failed to toggle user status on backend:', err);
      // Revert state on error
      setUsers(prev => prev.map(u => u.id === userId ? {
        ...u,
        status: user.status
      } : u));
    }
  };

  const handleRefresh = () => {
    fetchStaticData();
    fetchUsersData();
  };

  const props = {
    activeTab,
    setActiveTab,
    users,
    roles,
    tenantInfo,
    tenantsList,
    isSuperAdmin,
    allPermissions,
    loading,
    error,
    userModalOpen,
    setUserModalOpen,
    editingUser,
    setEditingUser,
    roleModalOpen,
    setRoleModalOpen,
    editingRole,
    setEditingRole,
    onSaveUser: handleSaveUser,
    onSaveRole: handleSaveRole,
    onToggleUserStatus: handleToggleUserStatus,
    onUpdateTenant: handleUpdateTenant,
    onRefresh: handleRefresh,
    searchVal,
    setSearchVal,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    columnFilters,
    setColumnFilters,
    sortConfig,
    setSortConfig
  };

  return isDesktop ? <DashboardDesktop {...props} /> : <DashboardMobile {...props} />;
};
