import React from 'react';
import { Button, Input, Select } from '@geeksman/core-ui';
import { Link } from 'react-router-dom';

interface TenantSetupProps {
  code: string;
  setCode: (val: string) => void;
  name: string;
  setName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  workspace: string;
  setWorkspace: (val: string) => void;
  service: string;
  setService: (val: string) => void;
  adminPassword: string;
  setAdminPassword: (val: string) => void;
  loading: boolean;
  success: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}

export const TenantSetupDesktop: React.FC<TenantSetupProps> = ({
  code,
  setCode,
  name,
  setName,
  phone,
  setPhone,
  email,
  setEmail,
  workspace,
  setWorkspace,
  service,
  setService,
  adminPassword,
  setAdminPassword,
  loading,
  success,
  error,
  onSubmit,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  };

  const cardStyle: React.CSSProperties = {
    width: '640px',
    padding: '3rem',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    marginBottom: '0.375rem',
    display: 'block',
  };

  const selectStyle: React.CSSProperties = {
    padding: '0.625rem 0.875rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
    marginBottom: '1rem',
  };

  return (
    <div style={containerStyle}>
      <div className="glass" style={cardStyle}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
            Register New Tenant
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Create an isolated tenant workspace environment.
          </p>
        </div>

        {success && (
          <div style={{
            padding: '1rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--success)',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            lineHeight: 1.4
          }}>
            <strong>Tenant successfully initialized!</strong> An administrator account has been auto-created with the same email and your password. You can now log in using the credentials.
          </div>
        )}

        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--danger)',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            lineHeight: 1.4
          }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Tenant Code"
              type="text"
              placeholder="e.g. apple-corp"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Input
              label="Tenant Name"
              type="text"
              placeholder="e.g. Apple Corporation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Contact Phone"
              type="tel"
              placeholder="e.g. +1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Admin Email"
              type="email"
              placeholder="e.g. contact@apple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Workspace Code"
              type="text"
              placeholder="e.g. main-ws"
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
              required
            />
            <div>
              <label style={labelStyle}>Assigned Service</label>
              <Select
                value={service}
                onChange={(val) => setService(String(val))}
                options={[
                  { value: 'crm', label: 'CRM Service (Customer Relations)' },
                  { value: 'tms', label: 'TMS Service (Tenant management)' },
                  { value: 'erp', label: 'ERP Service (Enterprise planning)' },
                ]}
                placeholder="Select service..."
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Admin Password"
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />
            <div />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <Button type="submit" isLoading={loading} style={{ flex: 1, padding: '0.8rem' }}>
              Initialize Workspace
            </Button>
            <Link to="/login" style={{ flex: 1, textDecoration: 'none' }}>
              <Button type="button" variant="secondary" style={{ width: '100%', padding: '0.8rem' }}>
                Back to Login
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
