import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button, Input, useToast, apiClient, Select } from '@geeksman/core-ui';
import { User, Role } from '../Dashboard/Dashboard';

interface UserSetupProps {
  user: User | null;
  rolesList: Role[];
  onSave: (payload: any) => void;
  onClose: () => void;
}

export const UserSetup: React.FC<UserSetupProps> = ({
  user,
  rolesList,
  onSave,
  onClose,
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [password, setPassword] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
      setPhoneError('');
      setPassword(''); // Don't prefill password
      setEmployeeId(user.employee_id);
      setTimezone(user.timezone || 'Asia/Kolkata');
      setSelectedRoleIds(user.role_ids || []);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setPhoneError('');
      setPassword('');
      setEmployeeId('');
      setTimezone('Asia/Kolkata');
      setSelectedRoleIds([]);
    }
  }, [user]);

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    setPhoneError('');
  };

  const checkPhoneUniqueness = async () => {
    if (!phone) return;
    try {
      const response = await apiClient.get('/tenant/users/check-phone', {
        params: {
          phone,
          exclude_id: user?.id || undefined
        }
      });
      if (response.data && response.data.data) {
        if (!response.data.data.unique) {
          setPhoneError('This phone number is already taken.');
        } else {
          setPhoneError('');
        }
      }
    } catch (err) {
      console.error('Error checking phone uniqueness:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneError) {
      showToast('Please resolve the errors before saving', 'warning');
      return;
    }
    if (selectedRoleIds.length === 0) {
      showToast('Please select at least one role', 'warning');
      return;
    }

    const payload: any = {
      name,
      email,
      phone,
      employee_id: employeeId,
      timezone,
      role_ids: selectedRoleIds,
      is_all_subscriptions: true, // Defaulting as required by standard backend
    };

    if (password) {
      payload.password = password;
    }

    onSave(payload);
  };

  const handleToggleRole = (roleId: string) => {
    setSelectedRoleIds(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
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
    width: '500px',
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

  const roleListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    maxHeight: '180px',
    overflowY: 'auto',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '0.75rem',
    backgroundColor: 'var(--bg-primary)',
    marginBottom: '1rem',
  };

  return createPortal(
    <div style={backdropStyle} onClick={onClose}>
      <div className="slide-in" style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
          {user ? 'Edit User Profile' : 'Create New User'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ flex: 1 }}>
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="john@apple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 555-0199"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={checkPhoneUniqueness}
              required
            />
            {phoneError && (
              <span style={{ color: 'var(--danger)', fontSize: '0.8rem', display: 'block', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                {phoneError}
              </span>
            )}
            <Input
              label={user ? 'Password (Leave blank to keep unchanged)' : 'Initial Password'}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!user}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <Input
                label="Employee ID"
                type="text"
                placeholder="EMP-100"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  Timezone
                </label>
                <Select
                  value={timezone}
                  onChange={(val) => setTimezone(String(val))}
                  options={[
                    { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
                    { value: 'UTC', label: 'UTC' },
                    { value: 'America/New_York', label: 'America/New_York' },
                    { value: 'Europe/London', label: 'Europe/London' },
                    { value: 'Asia/Singapore', label: 'Asia/Singapore' },
                  ]}
                  placeholder="Select timezone..."
                />
              </div>
            </div>

            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>
              Assign Roles (Select at least one)
            </label>
            <div style={roleListStyle}>
              {rolesList.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No roles defined. Create roles first.</span>
              ) : (
                rolesList.map((role) => (
                  <label key={role.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedRoleIds.includes(role.id)}
                      onChange={() => handleToggleRole(role.id)}
                    />
                    <span>{role.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <Button type="submit" style={{ flex: 1 }}>
              Save User
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
