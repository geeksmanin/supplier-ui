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

export const TenantSetupMobile: React.FC<TenantSetupProps> = ({
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
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    padding: '1.5rem',
    boxSizing: 'border-box',
    justifyContent: 'center',
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
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0' }}>
          New Tenant
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          Setup Tenant Workspace
        </p>
      </div>

      <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        {success && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--success)',
            fontSize: '0.8rem',
            marginBottom: '1rem',
            lineHeight: 1.4
          }}>
            Tenant initialized successfully! Proceed to sign in.
          </div>
        )}

        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--danger)',
            fontSize: '0.8rem',
            marginBottom: '1rem',
            lineHeight: 1.4
          }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
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
            placeholder="e.g. admin@apple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Workspace"
            type="text"
            placeholder="e.g. main-ws"
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
            required
          />
          <Input
            label="Admin Password"
            type="password"
            placeholder="Enter admin password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
          />
          
          <div>
            <label style={labelStyle}>Assigned Service</label>
            <Select
              value={service}
              onChange={(val) => setService(String(val))}
              options={[
                { value: 'crm', label: 'CRM Service' },
                { value: 'tms', label: 'TMS Service' },
                { value: 'erp', label: 'ERP Service' },
              ]}
              placeholder="Select service..."
            />
          </div>

          <Button type="submit" isLoading={loading} style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>
            Register Tenant
          </Button>

          <Link to="/login" style={{ textDecoration: 'none', display: 'block', marginTop: '0.75rem' }}>
            <Button type="button" variant="secondary" style={{ width: '100%', padding: '0.75rem' }}>
              Back to Login
            </Button>
          </Link>
        </form>
      </div>
    </div>
  );
};
