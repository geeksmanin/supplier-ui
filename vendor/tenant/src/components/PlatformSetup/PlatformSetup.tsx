import React, { useState } from 'react';
import { Button, Input, apiClient } from '@geeksman/core-ui';

interface PlatformSetupProps {
  onComplete: () => void;
}

export const PlatformSetup: React.FC<PlatformSetupProps> = ({ onComplete }) => {
  const [code, setCode] = useState('platform');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [workspace, setWorkspace] = useState('platform');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!code || !name || !phone || !email || !workspace || !adminEmail || !adminPassword) {
        throw new Error('Please fill in all fields');
      }

      await apiClient.post('/tenant/setup', {
        code,
        name,
        phone,
        email,
        workspace,
        admin_email: adminEmail,
        admin_password: adminPassword,
      });

      // Clear any stale session/token data to ensure user is redirected to login
      localStorage.removeItem('token');
      localStorage.removeItem('user_email');
      localStorage.removeItem('tenant_code');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_name');
      localStorage.removeItem('current_tenant_code');
      localStorage.removeItem('current_tenant_name');

      onComplete();
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Setup failed. Please check inputs or system logs.'
      );
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc', // Light gray background
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  };

  const cardStyle: React.CSSProperties = {
    width: '900px',
    display: 'flex',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
  };

  const leftPanelStyle: React.CSSProperties = {
    width: '360px',
    backgroundColor: '#f1f5f9', // Professional slate light background
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '3rem',
    color: '#0f172a', // Dark slate text
    borderRight: '1px solid #e2e8f0',
  };

  const rightPanelStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '3rem',
    boxSizing: 'border-box',
    color: '#0f172a',
    backgroundColor: '#ffffff',
  };

  const badgeStyle: React.CSSProperties = {
    alignSelf: 'flex-start',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 600,
    backgroundColor: '#e2e8f0',
    color: '#3b82f6',
    border: '1px solid #cbd5e1',
    letterSpacing: '0.05em',
    marginBottom: '1rem',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Left Side Info Panel */}
        <div style={leftPanelStyle}>
          <div>
            <div style={badgeStyle}>SYSTEM INITIALIZER</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 1rem 0', letterSpacing: '-0.02em', color: '#1e3a8a' }}>
              Geeksman <span style={{ color: '#3b82f6' }}>OS</span>
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
              Configure the primary platform tenant and administrative credentials to register and manage secondary system workspaces.
            </p>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', lineHeight: 1.5 }}>
            <div>// SERVICE STATUS: INACTIVE</div>
            <div>// INITIALIZATION REQUIRED</div>
          </div>
        </div>

        {/* Right Side Form Panel */}
        <div style={rightPanelStyle}>
          <div style={{ width: '100%' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: '#0f172a' }}>
              Platform Tenant Setup
            </h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
              Please enter the master organizational details below.
            </p>

            {error && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '6px',
                color: '#991b1b',
                fontSize: '0.8rem',
                marginBottom: '1.25rem',
                lineHeight: 1.4
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Input
                  label="Tenant Name"
                  type="text"
                  placeholder="e.g. Geeksman HQ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Phone"
                  type="text"
                  placeholder="e.g. +123456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <Input
                label="Tenant Contact Email"
                type="email"
                placeholder="e.g. contact@platform.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Admin Username / Email"
                type="email"
                placeholder="e.g. admin@platform.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
              <Input
                label="Admin Password"
                type="password"
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                isLoading={loading}
                style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', borderRadius: '6px', background: '#2563eb', color: '#ffffff', fontWeight: 600 }}
              >
                Initialize System
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
