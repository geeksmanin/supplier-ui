import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button, Input, useToast, Select } from '@geeksman/core-ui';
import { Role } from '../Dashboard/Dashboard';

interface RoleSetupProps {
  role: Role | null;
  allPermissions: Array<any>;
  onSave: (payload: any) => void;
  onClose: () => void;
}

export const RoleSetup: React.FC<RoleSetupProps> = ({
  role,
  allPermissions,
  onSave,
  onClose,
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [permissionScopes, setPermissionScopes] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const groupedPermissions = React.useMemo(() => {
    const groups: Record<string, typeof allPermissions> = {};
    const filtered = searchQuery
      ? allPermissions.filter((perm: any) => 
          perm.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          perm.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          perm.entity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          perm.action?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : allPermissions;

    filtered.forEach((perm: any) => {
      const serviceName = (perm.services && perm.services.length > 0) 
        ? perm.services[0] 
        : (perm.entity ? perm.entity : 'general');
      const groupName = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(perm);
    });
    return groups;
  }, [allPermissions, searchQuery]);

  useEffect(() => {
    if (role) {
      setName(role.name);
      const ids: string[] = [];
      const scopes: Record<string, string> = {};
      if (role.permissions) {
        role.permissions.forEach((perm: any) => {
          const id = (typeof perm === 'object' && perm !== null) ? perm.id : perm;
          const scope = (typeof perm === 'object' && perm !== null) ? (perm.scope || 'all') : 'all';
          ids.push(id);
          scopes[id] = scope;
        });
      }
      setSelectedPermissionIds(ids);
      setPermissionScopes(scopes);
    } else {
      setName('');
      setSelectedPermissionIds([]);
      setPermissionScopes({});
    }
  }, [role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPermissionIds.length === 0) {
      showToast('Please select at least one permission', 'warning');
      return;
    }

    const permissionsPayload = selectedPermissionIds.map(id => ({
      permission_id: id,
      scope: permissionScopes[id] || 'all',
    }));

    onSave({
      name,
      permission_ids: selectedPermissionIds,
      permissions: permissionsPayload,
    });
  };

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissionIds(prev => {
      const isSelected = prev.includes(permissionId);
      if (isSelected) {
        setPermissionScopes(scopes => {
          const next = { ...scopes };
          delete next[permissionId];
          return next;
        });
        return prev.filter(id => id !== permissionId);
      } else {
        setPermissionScopes(scopes => ({ ...scopes, [permissionId]: 'all' }));
        return [...prev, permissionId];
      }
    });
  };

  const handleScopeChange = (permissionId: string, scope: string) => {
    setPermissionScopes(prev => ({
      ...prev,
      [permissionId]: scope,
    }));
  };

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 9999,
    backdropFilter: 'blur(4px)',
  };

  const modalStyle: React.CSSProperties = {
    width: '460px',
    height: '100%',
    backgroundColor: 'var(--bg-secondary)',
    borderLeft: '1px solid var(--border-color)',
    padding: '2.5rem 2rem',
    boxSizing: 'border-box',
    boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  };

  const permissionGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    maxHeight: '350px',
    overflowY: 'auto',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '0.75rem',
    backgroundColor: 'var(--bg-primary)',
    marginBottom: '1.5rem',
  };

  return createPortal(
    <div style={backdropStyle} onClick={onClose}>
      <div className="slide-in" style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
          {role ? 'Edit Role Permissions' : 'Create Custom Role'}
        </h3>

        {role?.is_system_defined && (
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--warning)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid var(--warning)',
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1rem'
          }}>
            Warning: This is a system-defined role. Modifying it may affect critical operational access.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ flex: 1 }}>
            <Input
              label="Role Name"
              type="text"
              placeholder="e.g. Inventory Manager"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={role?.is_system_defined}
              required
            />

            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>
              Mapped System Permissions
            </label>
            <Input
              type="text"
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ marginBottom: '1rem' }}
            />
            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: 'var(--bg-primary)', marginBottom: '1.5rem' }}>
              {Object.entries(groupedPermissions).map(([groupName, perms]) => (
                <div key={groupName} style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                    {groupName}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {perms.map((perm: any) => {
                      const isSelected = selectedPermissionIds.includes(perm.id);
                      return (
                        <div key={perm.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', flex: 1 }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleTogglePermission(perm.id)}
                            />
                            <span title={perm.key}>{perm.name}</span>
                          </label>
                          {isSelected && (
                            <Select
                              value={permissionScopes[perm.id] || 'all'}
                              onChange={(val) => handleScopeChange(perm.id, String(val))}
                              options={[
                                { value: 'all', label: 'All' },
                                { value: 'ownTeam', label: 'Own Team' },
                                { value: 'own', label: 'Own Only' },
                              ]}
                              style={{ minWidth: '100px', width: '100px', fontSize: '0.75rem' }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <Button type="submit" style={{ flex: 1 }}>
              Save Role
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
