import React, { useState, useEffect, useRef } from 'react';
import { Button, DataTable, Column, DEFAULT_SHORTCUTS, getShortcutBindings, apiClient, Select } from '@geeksman/core-ui';
import { User, Role, TenantInfo } from './Dashboard';
import { UserSetup } from '../UserSetup/UserSetup';
import { RoleSetup } from '../RoleSetup/RoleSetup';
import { useNavigate } from 'react-router-dom';

interface DashboardDesktopProps {
  activeTab: 'dashboard' | 'users' | 'roles' | 'tenant' | 'super_tenants' | 'shortcuts';
  setActiveTab: (tab: 'dashboard' | 'users' | 'roles' | 'tenant' | 'super_tenants' | 'shortcuts') => void;
  users: User[];
  roles: Role[];
  tenantInfo: TenantInfo | null;
  tenantsList: TenantInfo[];
  isSuperAdmin: boolean;
  allPermissions: Array<{ id: string; name: string; key: string }>;
  loading: boolean;
  error: string;
  userModalOpen: boolean;
  setUserModalOpen: (val: boolean) => void;
  editingUser: User | null;
  setEditingUser: (val: User | null) => void;
  roleModalOpen: boolean;
  setRoleModalOpen: (val: boolean) => void;
  editingRole: Role | null;
  setEditingRole: (val: Role | null) => void;
  onSaveUser: (payload: any) => void;
  onSaveRole: (payload: any) => void;
  onToggleUserStatus: (id: string) => void;
  onUpdateTenant: (name: string, phone: string, email: string, appName?: string, logoUrl?: string, faviconUrl?: string, staffAppName?: string, staffLogoUrl?: string, customerAppName?: string, customerLogoUrl?: string) => void;
  onRefresh: () => void;
  searchVal: string;
  setSearchVal: (val: string) => void;
  pageSize: number;
  setPageSize: (val: number) => void;
  currentPage: number;
  setCurrentPage: (val: number) => void;
  columnFilters: Record<string, string>;
  setColumnFilters: (val: Record<string, string>) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  setSortConfig: (val: { key: string; direction: 'asc' | 'desc' } | null) => void;
}

const getAbsoluteLogoUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const config = (window as any).runtimeConfig as any;
  const backendBase = config?.apiBaseUrl || 'https://erpapi.geeksman.co.in';
  let backendHost = '';
  if (backendBase.startsWith('http://') || backendBase.startsWith('https://')) {
    backendHost = backendBase.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
  }
  return `${backendHost}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const DashboardDesktop: React.FC<DashboardDesktopProps> = ({
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
  onSaveUser,
  onSaveRole,
  onToggleUserStatus,
  onUpdateTenant,
  onRefresh,
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
}) => {
  const navigate = useNavigate();
  const [shortcuts, setShortcuts] = useState<Record<string, string>>(() => getShortcutBindings());
  const [tenantName, setTenantName] = useState(tenantInfo?.name || '');
  const [tenantPhone, setTenantPhone] = useState(tenantInfo?.phone || '');
  const [tenantEmail, setTenantEmail] = useState(tenantInfo?.email || '');
  const [appName, setAppName] = useState(tenantInfo?.app_name || '');
  const [logoUrl, setLogoUrl] = useState(tenantInfo?.logo_url || '');
  const [faviconUrl, setFaviconUrl] = useState(tenantInfo?.favicon_url || '');
  const [staffAppName, setStaffAppName] = useState(tenantInfo?.staff_app_name || '');
  const [staffLogoUrl, setStaffLogoUrl] = useState(tenantInfo?.staff_logo_url || '');
  const [customerAppName, setCustomerAppName] = useState(tenantInfo?.customer_app_name || '');
  const [customerLogoUrl, setCustomerLogoUrl] = useState(tenantInfo?.customer_logo_url || '');
  const [staffLogoUploading, setStaffLogoUploading] = useState(false);
  const [customerLogoUploading, setCustomerLogoUploading] = useState(false);

  // Custom Domains state for Platform Admin
  const [selectedDomainTenant, setSelectedDomainTenant] = useState<TenantInfo | null>(null);
  const [domainModalOpen, setDomainModalOpen] = useState(false);
  const [domainsList, setDomainsList] = useState<Array<{ id: string; domain: string; app_type: string; is_primary: boolean }>>([]);
  const [domainLoading, setDomainLoading] = useState(false);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [newDomainAppType, setNewDomainAppType] = useState('ALL');
  const [newDomainIsPrimary, setNewDomainIsPrimary] = useState(false);
  const [domainError, setDomainError] = useState('');

  const openDomainsModal = async (tenant: TenantInfo) => {
    setSelectedDomainTenant(tenant);
    setDomainModalOpen(true);
    setDomainError('');
    setNewDomainInput('');
    setNewDomainAppType('ALL');
    setNewDomainIsPrimary(false);
    setDomainLoading(true);
    try {
      const res = await apiClient.get(`/tenant/${tenant.id}/domains`);
      setDomainsList(res.data?.data || []);
    } catch (e: any) {
      setDomainError(e.response?.data?.message || 'Failed to load domains');
    } finally {
      setDomainLoading(false);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDomainTenant || !newDomainInput.trim()) return;
    setDomainError('');
    try {
      const res = await apiClient.post(`/tenant/${selectedDomainTenant.id}/domains`, {
        domain: newDomainInput.trim(),
        app_type: newDomainAppType,
        is_primary: newDomainIsPrimary,
      });
      if (res.data?.data) {
        setDomainsList(prev => [...prev, res.data.data]);
        setNewDomainInput('');
        setNewDomainIsPrimary(false);
      }
    } catch (e: any) {
      setDomainError(e.response?.data?.message || 'Failed to add domain');
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (!selectedDomainTenant) return;
    if (!window.confirm('Are you sure you want to delete this custom domain?')) return;
    try {
      await apiClient.delete(`/tenant/${selectedDomainTenant.id}/domains/${domainId}`);
      setDomainsList(prev => prev.filter(d => d.id !== domainId));
    } catch (e: any) {
      setDomainError(e.response?.data?.message || 'Failed to delete domain');
    }
  };

  // Filter and Search states
  const [hubFilter, setHubFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const localSearchInputRef = useRef<HTMLInputElement>(null);

  // Kebab menu state
  const [activeKebabUserId, setActiveKebabUserId] = useState<string | null>(null);
  const [activeKebabTenantId, setActiveKebabTenantId] = useState<string | null>(null);
  const [activeKebabRoleId, setActiveKebabRoleId] = useState<string | null>(null);
  
  const kebabContainerRef = useRef<HTMLDivElement>(null);

  // Hotkey listener for Cmd+/ or Ctrl+/ to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        localSearchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close kebab menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (kebabContainerRef.current && !kebabContainerRef.current.contains(e.target as Node)) {
        setActiveKebabUserId(null);
        setActiveKebabTenantId(null);
        setActiveKebabRoleId(null);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  React.useEffect(() => {
    if (tenantInfo) {
      setTenantName(tenantInfo.name);
      setTenantPhone(tenantInfo.phone);
      setTenantEmail(tenantInfo.email);
      setAppName(tenantInfo.app_name || '');
      setLogoUrl(tenantInfo.logo_url || '');
      setFaviconUrl(tenantInfo.favicon_url || '');
      setStaffAppName(tenantInfo.staff_app_name || '');
      setStaffLogoUrl(tenantInfo.staff_logo_url || '');
      setCustomerAppName(tenantInfo.customer_app_name || '');
      setCustomerLogoUrl(tenantInfo.customer_logo_url || '');
    }
  }, [tenantInfo]);

  const handleLogoUpload = async (file: File, target: 'staff' | 'customer') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'branding');
    if (target === 'staff') {
      setStaffLogoUploading(true);
    } else {
      setCustomerLogoUploading(true);
    }
    try {
      const res = await apiClient.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.url || res.data?.upload_url || `/media/download/${res.data?.uploadId || res.data?.upload_id}`;
      const uploadId = res.data?.upload_id || res.data?.uploadId;
      if (target === 'staff') {
        setStaffLogoUrl(url || uploadId);
      } else {
        setCustomerLogoUrl(url || uploadId);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload logo.');
    } finally {
      if (target === 'staff') {
        setStaffLogoUploading(false);
      } else {
        setCustomerLogoUploading(false);
      }
    }
  };

  const getPermissionName = (perm: any) => {
    if (!perm) return '';
    const id = (typeof perm === 'object' && perm !== null) ? perm.id : perm;
    const scope = (typeof perm === 'object' && perm !== null) ? perm.scope : '';
    const found = allPermissions.find(p => p.id === id);
    let baseName = '';
    if (found) {
      baseName = found.name;
    } else if (typeof perm === 'object' && perm !== null) {
      baseName = perm.display_name || perm.name || perm.id || '';
    } else {
      baseName = perm;
    }
    if (scope) {
      const formattedScope = scope.charAt(0).toUpperCase() + scope.slice(1);
      return `${baseName} (${formattedScope})`;
    }
    return baseName;
  };

  const startIdx = (currentPage - 1) * pageSize;

  const tenantColumns: Column<TenantInfo>[] = [
    { key: 'index', label: '#', width: '60px', render: (_, __, idx) => idx + 1 },
    { key: 'code', label: 'Code', render: (val) => <span className="erp-link" onClick={() => navigate('/settings/workspace')}>{val}</span> },
    { key: 'name', label: 'Tenant Name', render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: 'email', label: 'Admin Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'workspace', label: 'Workspace' },
    { key: 'service', label: 'Service Suite', render: (val) => <span className="badge badge-info">{(val || '').toUpperCase()}</span> },
    {
      key: 'action',
      label: 'Action',
      align: 'center',
      width: '80px',
      render: (_, tenant, idx) => {
        const isFirstRow = idx === 0;
        return (
          <div style={{ position: 'relative' }}>
            <button className="kebab-btn" onClick={() => setActiveKebabTenantId(activeKebabTenantId === tenant.id ? null : tenant.id)}>
              ⋮
            </button>
            {activeKebabTenantId === tenant.id && (
              <div style={{
                position: 'absolute',
                right: '40px',
                top: isFirstRow ? '10px' : 'auto',
                bottom: isFirstRow ? 'auto' : '10px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)',
                zIndex: 50,
                width: '140px',
                textAlign: 'left',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer' }} onClick={() => { setActiveKebabTenantId(null); navigate('/settings/workspace'); }}>View Settings</div>
                <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer', borderTop: '1px solid #e5e7eb' }} onClick={() => { setActiveKebabTenantId(null); openDomainsModal(tenant); }}>Custom Domains</div>
                <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer', borderTop: '1px solid #e5e7eb', color: 'var(--danger)' }} onClick={() => setActiveKebabTenantId(null)}>Suspend Tenant</div>
                <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer', borderTop: '1px solid #e5e7eb', color: 'var(--danger)' }} onClick={async () => {
                  setActiveKebabTenantId(null);
                  const confirmReset = window.confirm(`Are you sure you want to completely delete and reset the database for tenant "${tenant.name}" (${tenant.code})? All customer contacts, products, and configurations inside this tenant will be permanently deleted!`);
                  if (confirmReset) {
                    const adminPassword = window.prompt("Enter new admin password (or leave blank to use default):", "1234");
                    if (adminPassword !== null) {
                      try {
                        await apiClient.post(`/tenant/${tenant.code}/reset`, { admin_password: adminPassword });
                        alert("Database reset successfully!");
                      } catch (err: any) {
                        alert("Error resetting database: " + (err.response?.data?.message || err.message));
                      }
                    }
                  }
                }}>Reset Database</div>
              </div>
            )}
          </div>
        );
      }
    }
  ];

  const userColumns: Column<User>[] = [
    { key: 'index', label: '#', width: '60px', render: (_, __, idx) => startIdx + idx + 1 },
    { key: 'name', label: 'Name', sortable: true, filterType: 'text', filterPlaceholder: 'Filter Name...', render: (val, user) => <span style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 500 }} onClick={() => { setEditingUser(user); setUserModalOpen(true); }}>{val}</span> },
    { key: 'status', label: 'Status', filterType: 'select', filterOptions: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }], render: (val) => <span className={`badge ${val === 'active' ? 'badge-success' : 'badge-danger'}`}>{val === 'active' ? 'Active' : 'Inactive'}</span> },
    { key: 'employee_id', label: 'Username', filterType: 'text', filterPlaceholder: 'Filter User...', render: (val, user) => val || user.name.toLowerCase().replace(/\s+/g, '') },
    { key: 'email', label: 'Email ID', textTransformNone: true, sortable: true, filterType: 'text', filterPlaceholder: 'Filter Email...', render: (val) => val || '-' },
    { key: 'phone', label: 'Contact No.', filterType: 'text', filterPlaceholder: 'Filter Phone...', render: (val) => val || '-' },
    { key: 'expiry', label: 'Account Expiry At', sortable: true, render: () => '-' },
    { key: 'created_at', label: 'Created At', sortable: true, render: (val) => val ? new Date(val).toLocaleString() : '-' },
    { key: 'created_by', label: 'Created By', filterType: 'text', filterPlaceholder: 'Filter Creator...', render: (val) => val?.name || '-' },
    {
      key: 'action',
      label: 'Action',
      align: 'center',
      width: '80px',
      render: (_, user, idx) => {
        const isFirstRow = idx === 0;
        return (
          <div style={{ position: 'relative' }}>
            <button className="kebab-btn" onClick={() => setActiveKebabUserId(activeKebabUserId === user.id ? null : user.id)}>
              ⋮
            </button>
            {activeKebabUserId === user.id && (
              <div style={{
                position: 'absolute',
                right: '40px',
                top: isFirstRow ? '10px' : 'auto',
                bottom: isFirstRow ? 'auto' : '10px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)',
                zIndex: 50,
                width: '140px',
                textAlign: 'left',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer' }} onClick={() => { setActiveKebabUserId(null); setEditingUser(user); setUserModalOpen(true); }}>Edit Profile</div>
                <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer', borderTop: '1px solid #e5e7eb' }} onClick={() => { setActiveKebabUserId(null); onToggleUserStatus(user.id); }}>Toggle Status</div>
              </div>
            )}
          </div>
        );
      }
    }
  ];

  const roleColumns: Column<Role>[] = [
    { key: 'index', label: '#', width: '60px', render: (_, __, idx) => idx + 1 },
    { key: 'name', label: 'Role Name', sortable: true, filterType: 'text', filterPlaceholder: 'Filter Role Name...', render: (val, role) => <span className="erp-link" onClick={() => { setEditingRole(role); setRoleModalOpen(true); }}>{val}</span> },
    { key: 'is_system_defined', label: 'System Role', sortable: true, filterType: 'select', filterOptions: [{ label: 'System', value: 'true' }, { label: 'Custom', value: 'false' }], render: (val) => <span className={`badge ${val ? 'badge-success' : 'badge-info'}`}>{val ? 'System' : 'Custom'}</span> },
    {
      key: 'permissions',
      label: 'Assigned Permissions Scope',
      render: (val: any[] | undefined) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {val && val.slice(0, 4).map(perm => {
            const p = perm as any;
            const keyStr = (p && typeof p === 'object') ? p.id : (p || '');
            return (
              <span key={keyStr} className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                {getPermissionName(perm)}
              </span>
            );
          })}
          {val && val.length > 4 && (
            <span style={{ fontSize: '0.75rem', alignSelf: 'center', color: '#6b7280', fontWeight: 600 }}>
              +{val.length - 4} more
            </span>
          )}
        </div>
      )
    },
    {
      key: 'action',
      label: 'Action',
      align: 'center',
      width: '80px',
      render: (_, role, idx) => {
        const isFirstRow = idx === 0;
        return (
          <div style={{ position: 'relative' }}>
            <button className="kebab-btn" onClick={() => setActiveKebabRoleId(activeKebabRoleId === role.id ? null : role.id)}>
              ⋮
            </button>
            {activeKebabRoleId === role.id && (
              <div style={{
                position: 'absolute',
                right: '40px',
                top: isFirstRow ? '10px' : 'auto',
                bottom: isFirstRow ? 'auto' : '10px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)',
                zIndex: 50,
                width: '140px',
                textAlign: 'left',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer' }} onClick={() => { setActiveKebabRoleId(null); setEditingRole(role); setRoleModalOpen(true); }}>Edit Permissions</div>
              </div>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="fade-in" style={{ width: '100%' }} ref={kebabContainerRef}>
      
      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          color: '#b91c1c',
          fontSize: '0.85rem',
          marginBottom: '1.5rem',
          fontWeight: 500
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* 0. General Metrics Dashboard View */}
      {activeTab === 'dashboard' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Welcome Banner Card */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            position: 'relative',
            minHeight: '220px',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            {/* Background Grid Pattern Overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.15,
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '20px 20px'
            }}></div>

            {/* Left Content Column */}
            <div style={{
              flex: '1 1 50%',
              padding: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              zIndex: 2,
              position: 'relative'
            }}>
              <span style={{
                backgroundColor: 'rgba(239, 246, 255, 0.15)',
                color: '#60a5fa',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '0.35rem 0.75rem',
                borderRadius: '99px',
                width: 'fit-content',
                marginBottom: '1rem',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                SYSTEM CONSOLE
              </span>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#ffffff', lineHeight: 1.2 }}>
                Welcome to Geeksman OS (Verified Update v9!)
              </h1>
              <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.925rem', color: '#cbd5e1', lineHeight: 1.5, maxWidth: '520px' }}>
                Manage workspaces, configure custom permission roles, onboard tenants, and control active user directory settings from this centralized dashboard console.
              </p>
            </div>

            {/* Right Banner Image Column */}
            <div style={{
              flex: '1 1 50%',
              backgroundImage: 'url("/dashboard-banner.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              zIndex: 1,
              borderLeft: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to right, #1e1b4b 0%, rgba(30, 27, 75, 0) 100%)',
              }}></div>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {/* Total Tenants Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Active Tenants</span>
                <span style={{ backgroundColor: '#eff6ff', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '6px' }}>Onboarded</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
                {isSuperAdmin ? tenantsList.length : 1}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>●</span> Workspace accounts operational
              </div>
            </div>

            {/* Total Users Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>User Directory</span>
                <span style={{ backgroundColor: '#ecfdf5', color: '#065f46', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                  {users.filter(u => u.status === 'active').length} Active
                </span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
                {users.length} Users
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                Registered directory accounts
              </div>
            </div>

            {/* Total Roles Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Roles Registry</span>
                <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                  {roles.filter(r => r.is_system_defined).length} System
                </span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
                {roles.length} Roles
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                Defined permission scopes
              </div>
            </div>

            {/* System Status Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Platform Health</span>
                <span style={{ backgroundColor: '#f0fdf4', color: '#166534', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '6px' }}>ONLINE</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>99.98%</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Average API Uptime</div>
            </div>
          </div>

          {/* Graphical Analytics Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
            {/* Monthly Operations Activity Chart */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827' }}>Monthly Operational Scale</h3>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>API calls / min</span>
              </div>
              <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                {[45, 60, 55, 75, 90, 80, 95, 85, 110, 100, 115, 130].map((val, idx) => (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      height: `${val}px`,
                      width: '100%',
                      background: 'linear-gradient(to top, var(--primary) 0%, #60a5fa 100%)',
                      borderRadius: '6px 6px 0 0',
                      opacity: 0.85,
                      transition: 'opacity 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.85'}
                    ></div>
                    <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 500 }}>{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][idx]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Usage & Connections Trends */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827' }}>System Active Sessions</h3>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Weekly trends</span>
              </div>
              <div style={{ height: '200px', position: 'relative', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'flex-end' }}>
                {/* SVG Line Graph */}
                <svg viewBox="0 0 400 150" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2"/>
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>
                  <path d="M 0 130 Q 100 80 200 110 T 400 30" fill="url(#gradient)" stroke="none"></path>
                  <path d="M 0 130 Q 100 80 200 110 T 400 30" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round"></path>
                  <circle cx="200" cy="110" r="6" fill="#ffffff" stroke="var(--primary)" strokeWidth="3"></circle>
                  <circle cx="400" cy="30" r="6" fill="#ffffff" stroke="var(--primary)" strokeWidth="3"></circle>
                </svg>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', padding: '0 0.5rem 0.5rem 0.5rem', fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600, zIndex: 5 }}>
                  <span>Q1</span>
                  <span>Q2</span>
                  <span>Q3</span>
                  <span>Q4</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Super Admin Tenants View */}
      {isSuperAdmin && activeTab === 'super_tenants' && (
        <div>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#111827' }}>Registered Tenants</h1>
          </div>

          <DataTable
            columns={tenantColumns}
            data={tenantsList}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            searchPlaceholder="Search in Code"
            searchShortcutLabel="⌘K"
            pageSize={pageSize}
            setPageSize={setPageSize}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalItems={tenantsList.length}
            onRefresh={onRefresh}
            actionButton={<Button onClick={() => navigate('/tenant-setup')}>+ Onboard Tenant</Button>}
          />
        </div>
      )}

      {/* 2. Users View */}
      {activeTab === 'users' && (() => {
        return (
          <div>
            {/* Header Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1.25rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#111827' }}>User Settings</h1>
            </div>

            <DataTable
              columns={userColumns}
              data={users}
              searchVal={searchVal}
              setSearchVal={setSearchVal}
              searchPlaceholder="Search in Name"
              pageSize={pageSize}
              setPageSize={setPageSize}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalItems={users.length}
              columnFilters={columnFilters}
              setColumnFilters={setColumnFilters}
              sortConfig={sortConfig}
              setSortConfig={setSortConfig}
              onRefresh={onRefresh}
              actionButton={<Button onClick={() => { setEditingUser(null); setUserModalOpen(true); }}>+ Create User</Button>}
            />
          </div>
        );
      })()}

      {/* 3. Roles View */}
      {activeTab === 'roles' && (
        <div>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#111827' }}>Role Settings</h1>
          </div>

          <DataTable
            columns={roleColumns}
            data={roles}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            searchPlaceholder="Search Role"
            searchShortcutLabel="⌘K"
            pageSize={pageSize}
            setPageSize={setPageSize}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalItems={roles.length}
            onRefresh={onRefresh}
            actionButton={<Button onClick={() => { setEditingRole(null); setRoleModalOpen(true); }}>+ Add Role</Button>}
          />
        </div>
      )}

      {/* 4. Workspace Details Settings View */}
      {activeTab === 'tenant' && tenantInfo && (
        <div style={{ maxWidth: '800px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#111827' }}>Workspace Settings</h1>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Update your display settings and business profile details.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onUpdateTenant(tenantName, tenantPhone, tenantEmail, appName, logoUrl, faviconUrl, staffAppName, staffLogoUrl, customerAppName, customerLogoUrl); }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Tenant Code (read-only)</label>
                <input
                  type="text"
                  value={tenantInfo.code}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    outline: 'none',
                    cursor: 'not-allowed',
                    fontSize: '0.9rem'
                  }}
                  disabled
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Workspace Code (read-only)</label>
                <input
                  type="text"
                  value={tenantInfo.workspace}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    outline: 'none',
                    cursor: 'not-allowed',
                    fontSize: '0.9rem'
                  }}
                  disabled
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Display Name</label>
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Contact Phone</label>
                <input
                  type="text"
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Contact Email</label>
                <input
                  type="email"
                  value={tenantEmail}
                  onChange={(e) => setTenantEmail(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1.25rem 0', color: '#111827' }}>White-Labeling & Branding</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                {/* Staff App Branding Card */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#fafafa' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#1f2937', fontWeight: 600 }}>Staff Application</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Staff App Name</label>
                      <input
                        type="text"
                        value={staffAppName}
                        onChange={(e) => setStaffAppName(e.target.value)}
                        placeholder="Geeksman Staff ERP"
                        style={{
                          padding: '0.6rem 0.8rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          fontSize: '0.875rem'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Staff App Logo</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {staffLogoUrl && (
                          <img
                            src={getAbsoluteLogoUrl(staffLogoUrl)}
                            alt="Staff Logo Preview"
                            style={{ width: '48px', height: '48px', objectFit: 'contain', border: '1px solid #e5e7eb', borderRadius: '6px', backgroundColor: '#fff' }}
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLogoUpload(file, 'staff');
                          }}
                          style={{ fontSize: '0.8rem' }}
                          disabled={staffLogoUploading}
                        />
                      </div>
                      {staffLogoUploading && <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>Uploading Staff Logo...</span>}
                    </div>
                  </div>
                </div>

                {/* Customer App Branding Card */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#fafafa' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#1f2937', fontWeight: 600 }}>Customer Application</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Customer App Name</label>
                      <input
                        type="text"
                        value={customerAppName}
                        onChange={(e) => setCustomerAppName(e.target.value)}
                        placeholder="Geeksman Customer Portal"
                        style={{
                          padding: '0.6rem 0.8rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          fontSize: '0.875rem'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Customer App Logo</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {customerLogoUrl && (
                          <img
                            src={getAbsoluteLogoUrl(customerLogoUrl)}
                            alt="Customer Logo Preview"
                            style={{ width: '48px', height: '48px', objectFit: 'contain', border: '1px solid #e5e7eb', borderRadius: '6px', backgroundColor: '#fff' }}
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLogoUpload(file, 'customer');
                          }}
                          style={{ fontSize: '0.8rem' }}
                          disabled={customerLogoUploading}
                        />
                      </div>
                      {customerLogoUploading && <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>Uploading Customer Logo...</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Favicon URL (shared)</label>
                  <input
                    type="text"
                    value={faviconUrl}
                    onChange={(e) => setFaviconUrl(e.target.value)}
                    placeholder="/favicon.png"
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" isLoading={loading} style={{ padding: '0.75rem 1.5rem' }}>Save Parameters</Button>
          </form>
        </div>
      )}

      {/* 5. Keyboard Shortcuts Config View */}
      {activeTab === 'shortcuts' && (
        <div style={{ maxWidth: '800px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#111827' }}>Keyboard Shortcuts</h1>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Configure global key bindings for mouse-less ERP navigation. Click an input field and press your desired key combination.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem' }}>
            {[
              { key: 'saveForm', label: 'Save / Submit Form', desc: 'Saves active document or submits a form creation request.' },
              { key: 'cancelForm', label: 'Cancel Form / Go Back', desc: 'Discard unsaved form changes and return to previous dashboard list.' },
              { key: 'newItem', label: 'Create New Entry', desc: 'Navigates to the document creation form from list screens.' },
              { key: 'focusSearch', label: 'Focus List Search', desc: 'Focuses the query filter search input box on list views.' },
              { key: 'addLine', label: 'Add Line Item (Transaction Grid)', desc: 'Appends a new line item entry in commercial order tables.' }
            ].map(act => (
              <div key={act.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
                <div style={{ flex: 1, textAlign: 'left', paddingRight: '2rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 650, color: '#1f2937', display: 'block', marginBottom: '0.15rem' }}>{act.label}</label>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{act.desc}</span>
                </div>
                <div>
                  <input
                    type="text"
                    value={shortcuts[act.key] || ''}
                    placeholder="Press keys..."
                    readOnly
                    onKeyDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;
                      const parts: string[] = [];
                      if (e.ctrlKey) parts.push('ctrl');
                      if (e.altKey) parts.push('alt');
                      if (e.shiftKey) parts.push('shift');
                      if (e.metaKey) parts.push('meta');
                      const keyName = e.key === ' ' ? 'space' : e.key.toLowerCase();
                      parts.push(keyName);
                      const combo = parts.join('+');
                      setShortcuts(prev => ({ ...prev, [act.key]: combo }));
                    }}
                    style={{
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      backgroundColor: '#f9fafb',
                      width: '180px',
                      outline: 'none',
                      color: '#2563eb'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button
              variant="secondary"
              onClick={() => {
                setShortcuts(DEFAULT_SHORTCUTS);
                localStorage.setItem('erp_keyboard_shortcuts', JSON.stringify(DEFAULT_SHORTCUTS));
                alert('Shortcuts reset to defaults.');
              }}
            >
              Reset to Defaults
            </Button>
            <Button
              onClick={() => {
                localStorage.setItem('erp_keyboard_shortcuts', JSON.stringify(shortcuts));
                alert('Shortcuts saved successfully.');
              }}
            >
              Save Shortcuts
            </Button>
          </div>
        </div>
      )}

      {/* Modals Mount */}
      {userModalOpen && (
        <UserSetup
          user={editingUser}
          rolesList={roles}
          onSave={onSaveUser}
          onClose={() => { setUserModalOpen(false); setEditingUser(null); }}
        />
      )}

      {roleModalOpen && (
        <RoleSetup
          role={editingRole}
          allPermissions={allPermissions}
          onSave={onSaveRole}
          onClose={() => { setRoleModalOpen(false); setEditingRole(null); }}
        />
      )}

      {/* Custom Domains Modal for Platform Admin */}
      {domainModalOpen && selectedDomainTenant && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '620px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>
                  Custom Domains — {selectedDomainTenant.name}
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Manage custom domains routed to tenant <code>{selectedDomainTenant.code}</code>
                </p>
              </div>
              <button
                onClick={() => setDomainModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {domainError && (
                <div style={{
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  borderRadius: '6px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  fontSize: '0.85rem',
                }}>
                  {domainError}
                </div>
              )}

              {/* Add new domain form */}
              <form onSubmit={handleAddDomain} style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: '#374151' }}>
                  Add Custom Domain
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px auto', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="e.g. app.mycompany.com"
                    value={newDomainInput}
                    onChange={(e) => setNewDomainInput(e.target.value)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                    required
                  />
                  <Select
                    value={newDomainAppType}
                    onChange={(val) => setNewDomainAppType(String(val))}
                    options={[
                      { value: 'ALL', label: 'All Apps' },
                      { value: 'STAFF', label: 'Staff Only' },
                      { value: 'CUSTOMER', label: 'Customer Only' },
                    ]}
                    placeholder="Select app type..."
                    style={{ minWidth: '140px' }}
                  />
                  <Button type="submit" variant="primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                    + Add
                  </Button>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#4b5563', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newDomainIsPrimary}
                    onChange={(e) => setNewDomainIsPrimary(e.target.checked)}
                  />
                  Set as primary domain for this tenant
                </label>
              </form>

              {/* Domains list */}
              {domainLoading ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#6b7280', fontSize: '0.85rem' }}>
                  Loading custom domains...
                </div>
              ) : domainsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#6b7280', fontSize: '0.85rem' }}>
                  No custom domains mapped yet. Add one above!
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left', color: '#6b7280' }}>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Domain</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>App Scope</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Status</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domainsList.map((d) => (
                      <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '0.625rem 0.75rem', fontWeight: 600, color: '#111827' }}>
                          {d.domain}
                          {d.is_primary && (
                            <span style={{
                              marginLeft: '0.5rem',
                              fontSize: '0.7rem',
                              backgroundColor: '#dbeafe',
                              color: '#1d4ed8',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}>
                              Primary
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.625rem 0.75rem', color: '#4b5563' }}>
                          {d.app_type}
                        </td>
                        <td style={{ padding: '0.625rem 0.75rem' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontWeight: 500,
                          }}>
                            Active
                          </span>
                        </td>
                        <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteDomain(d.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 500,
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end',
              backgroundColor: '#f9fafb',
            }}>
              <Button variant="secondary" onClick={() => setDomainModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
