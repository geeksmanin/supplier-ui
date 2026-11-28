import React, { useState } from 'react';
import { Button, DEFAULT_SHORTCUTS, getShortcutBindings, Select } from '@geeksman/core-ui';
import { User, Role, TenantInfo } from './Dashboard';
import { UserSetup } from '../UserSetup/UserSetup';
import { RoleSetup } from '../RoleSetup/RoleSetup';
import { useNavigate } from 'react-router-dom';

interface DashboardMobileProps {
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
  onUpdateTenant: (name: string, phone: string, email: string) => void;
  onRefresh: () => void;
}

export const DashboardMobile: React.FC<DashboardMobileProps> = ({
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
}) => {
  const navigate = useNavigate();
  const [shortcuts, setShortcuts] = useState<Record<string, string>>(() => getShortcutBindings());
  const [tenantName, setTenantName] = useState(tenantInfo?.name || '');
  const [tenantPhone, setTenantPhone] = useState(tenantInfo?.phone || '');
  const [tenantEmail, setTenantEmail] = useState(tenantInfo?.email || '');

  React.useEffect(() => {
    if (tenantInfo) {
      setTenantName(tenantInfo.name);
      setTenantPhone(tenantInfo.phone);
      setTenantEmail(tenantInfo.email);
    }
  }, [tenantInfo]);

  const selectTabStyle: React.CSSProperties = {
    padding: '0.5rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
    marginBottom: '1rem',
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: 'var(--radius-md)',
    padding: '1.25rem',
    marginBottom: '1rem',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
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

  return (
    <div>
      {error && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: 'rgba(220, 38, 38, 0.08)',
          border: '1px solid var(--danger)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--danger)',
          fontSize: '0.8rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Tab Selector dropdown */}
      <div>
        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
          Console View
        </label>
        <Select
          value={activeTab}
          onChange={(val) => setActiveTab(val as any)}
          options={[
            { value: 'dashboard', label: 'Dashboard Overview' },
            ...(isSuperAdmin ? [{ value: 'super_tenants', label: 'Registered Tenants' }] : []),
            { value: 'users', label: 'Users Directory' },
            { value: 'roles', label: 'Roles Registry' },
            { value: 'tenant', label: 'Workspace Settings' },
            { value: 'shortcuts', label: 'Keyboard Shortcuts' },
          ]}
          placeholder="Console View..."
        />
      </div>

      {/* Dashboard Overview Tab */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Welcome Card */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)',
            borderRadius: '12px',
            padding: '1.25rem',
            color: '#ffffff',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700 }}>Geeksman OS</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4 }}>
              Centralized console to manage workspaces, configure permission roles, and track active platform users.
            </p>
          </div>

          {/* Metrics Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="glass" style={cardStyle}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Active Tenants</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{isSuperAdmin ? tenantsList.length : 1}</div>
            </div>

            <div className="glass" style={cardStyle}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Registered Users</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{users.length} Users</div>
            </div>

            <div className="glass" style={cardStyle}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Configured Roles</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{roles.length} Roles</div>
            </div>

            <div className="glass" style={cardStyle}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Platform Status</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success)' }}>99.98% ONLINE</div>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Tenants Tab */}
      {isSuperAdmin && activeTab === 'super_tenants' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Tenants</h3>
            <Button onClick={() => navigate('/tenant-setup')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Onboard</Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tenantsList.map((tenant) => (
              <div key={tenant.id} className="glass" style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold' }}>{tenant.name}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)' }}>{((tenant && tenant.service) || '').toUpperCase()}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div>Code: {tenant.code}</div>
                  <div>Email: {tenant.email}</div>
                  <div>Phone: {tenant.phone}</div>
                  <div>Workspace: {tenant.workspace}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Users</h3>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <Button onClick={onRefresh} variant="secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Sync</Button>
              <Button onClick={() => { setEditingUser(null); setUserModalOpen(true); }} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Add</Button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {users.map((user) => (
              <div key={user.id} className="glass" style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold' }}>{user.name}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    color: user.status === 'active' ? 'var(--success)' : 'var(--danger)',
                  }}>{user.status}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  <div>Email: {user.email}</div>
                  <div>Phone: {user.phone}</div>
                  <div>ID: {user.employee_id || '-'}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '0.5rem' }}>
                  <Button
                    onClick={() => onToggleUserStatus(user.id)}
                    variant="secondary"
                    style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem' }}
                  >
                    Toggle Status
                  </Button>
                  <Button
                    onClick={() => { setEditingUser(user); setUserModalOpen(true); }}
                    style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem' }}
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Roles</h3>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <Button onClick={onRefresh} variant="secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Sync</Button>
              <Button onClick={() => { setEditingRole(null); setRoleModalOpen(true); }} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Add</Button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {roles.map((role) => (
              <div key={role.id} className="glass" style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold' }}>{role.name}</span>
                  {role.is_system_defined && (
                    <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px' }}>
                      SYS
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.75rem' }}>
                  {role.permissions && role.permissions.map((permId) => {
                    const p = permId as any;
                    const keyStr = (p && typeof p === 'object') ? p.id : (p || '');
                    return (
                      <span key={keyStr} style={{
                        fontSize: '0.65rem',
                        backgroundColor: 'var(--bg-primary)',
                        padding: '0.15rem 0.3rem',
                        borderRadius: '3px'
                      }}>
                        {getPermissionName(permId)}
                      </span>
                    );
                  })}
                </div>
                <Button
                  onClick={() => { setEditingRole(role); setRoleModalOpen(true); }}
                  variant="ghost"
                  style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem' }}
                >
                  Edit Permissions
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tenant settings Tab */}
      {activeTab === 'tenant' && tenantInfo && (
        <div className="glass" style={cardStyle}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Workspace Details</h3>
          <form onSubmit={(e) => { e.preventDefault(); onUpdateTenant(tenantName, tenantPhone, tenantEmail); }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div>Code: <strong style={{ color: 'var(--text-primary)' }}>{(tenantInfo.code || '').toUpperCase()}</strong></div>
              <div>Suite: <strong style={{ color: 'var(--text-primary)' }}>{tenantInfo.workspace}</strong></div>
              <div>Service: <strong style={{ color: 'var(--accent)' }}>{(tenantInfo.service || '').toUpperCase()}</strong></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Display Name</label>
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Phone</label>
                <input
                  type="text"
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email</label>
                <input
                  type="email"
                  value={tenantEmail}
                  onChange={(e) => setTenantEmail(e.target.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                  required
                />
              </div>
            </div>

            <Button type="submit" isLoading={loading} style={{ width: '100%', padding: '0.6rem' }}>Save Parameters</Button>
          </form>
        </div>
      )}

      {activeTab === 'shortcuts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Keyboard Shortcuts</h3>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Configure global shortcuts. Tap an input and press keys to map.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { key: 'saveForm', label: 'Save / Submit Form' },
              { key: 'cancelForm', label: 'Cancel Form / Go Back' },
              { key: 'newItem', label: 'Create New Entry' },
              { key: 'focusSearch', label: 'Focus List Search' },
              { key: 'addLine', label: 'Add Line Item' }
            ].map(act => (
              <div key={act.key} className="glass" style={cardStyle}>
                <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.5rem', textAlign: 'left' }}>{act.label}</div>
                <input
                  type="text"
                  value={shortcuts[act.key] || ''}
                  placeholder="Tap and press keys..."
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
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    width: '100%',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                    outline: 'none'
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button
              variant="secondary"
              style={{ flex: 1 }}
              onClick={() => {
                setShortcuts(DEFAULT_SHORTCUTS);
                localStorage.setItem('erp_keyboard_shortcuts', JSON.stringify(DEFAULT_SHORTCUTS));
                alert('Shortcuts reset to defaults.');
              }}
            >
              Reset
            </Button>
            <Button
              style={{ flex: 1 }}
              onClick={() => {
                localStorage.setItem('erp_keyboard_shortcuts', JSON.stringify(shortcuts));
                alert('Shortcuts saved.');
              }}
            >
              Save
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
    </div>
  );
};
