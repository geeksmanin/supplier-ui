import React, { useState } from 'react';
import { WorkspacePill, GalaxyLoader } from '@geeksman/core-ui';

export interface LoginDesktopProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  loading: boolean;
  error: string | null;
  activeWorkspace: string;
  workspaceName?: string;
  workspaceLogo?: string;
  onOpenWorkspaceModal?: () => void;
  onWorkspaceChange?: (newCode: string, metadata?: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const LoginDesktop: React.FC<LoginDesktopProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loading,
  error,
  activeWorkspace,
  workspaceName,
  workspaceLogo,
  onOpenWorkspaceModal,
  onWorkspaceChange,
  onSubmit,
}) => {
  const [logoError, setLogoError] = useState(false);

  // Use workspace logo if provided/cached, fallback to official Geeksman logo
  const resolvedLogo =
    !logoError && (
      workspaceLogo ||
      localStorage.getItem('tenant_logo_url') ||
      (window as any).currentTenantConfig?.logo_url ||
      '/logo.png'
    );

  return (
    <div style={styles.container}>
      <style>{`
        .erp-login-input {
          width: 100%;
          padding: 0.75rem 0.95rem;
          background-color: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 10px;
          font-size: 0.9rem;
          color: #0f172a;
          outline: none;
          box-sizing: border-box;
          transition: all 0.15s ease;
        }
        .erp-login-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
        .erp-submit-btn {
          width: 100%;
          padding: 0.8rem;
          border-radius: 10px;
          font-size: 0.925rem;
          font-weight: 700;
          color: #ffffff;
          background-color: #0f172a;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.15s ease;
          box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.1);
        }
        .erp-submit-btn:hover {
          background-color: #1e293b;
          transform: translateY(-1px);
          box-shadow: 0 6px 10px -1px rgba(15, 23, 42, 0.15);
        }
        .erp-submit-btn:active {
          transform: translateY(0);
        }
        .erp-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-text-fill-color: #0f172a !important;
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {/* Centered Dual-Pane Card Box */}
      <div style={styles.cardBox}>
        {/* Left Half: Credentials & Login Information */}
        <div style={styles.leftPane}>
          <div style={styles.formContent}>
            {/* Header: Logo & Branding */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={styles.brandIconWrapper}>
                {resolvedLogo ? (
                  <img
                    src={resolvedLogo}
                    alt="Logo"
                    style={styles.brandLogoImg}
                    onError={() => {
                      if (!logoError) setLogoError(true);
                    }}
                  />
                ) : (
                  <img
                    src="/logo.png"
                    alt="Geeksman Logo"
                    style={styles.brandLogoImg}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
              </div>
              <h1 style={styles.title}>Geeksman OS</h1>
              <p style={styles.subtitle}>Sign in with your workspace credentials</p>
            </div>

            {error && (
              <div style={styles.errorAlert}>
                <span style={styles.errorDot} />
                <span style={{ flex: 1, fontSize: '0.8rem', color: '#b91c1c', fontWeight: 500 }}>
                  {error}
                </span>
              </div>
            )}

            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Workspace Indicator directly above Email field */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' }}>
                <WorkspacePill
                  workspaceCode={activeWorkspace}
                  workspaceName={workspaceName}
                  onChangeClick={onOpenWorkspaceModal}
                  onWorkspaceChange={onWorkspaceChange}
                  variant="light"
                />
              </div>

              <div>
                <label style={styles.label}>Email Address or Mobile</label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="erp-login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@company.com"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <label style={styles.label}>Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.togglePasswordBtn}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="erp-login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="erp-submit-btn"
                style={{ marginTop: '0.35rem' }}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div style={styles.footer}>
              <span>Secured with end-to-end multi-tenant isolation</span>
            </div>
          </div>
        </div>

        {/* Right Half: Pure Ongoing Geeksman Dome Particle Loader with Light Theme */}
        <div style={styles.rightPane}>
          <GalaxyLoader fullscreen={false} theme="light" />
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1.5rem',
    boxSizing: 'border-box',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  cardBox: {
    width: '100%',
    maxWidth: '880px',
    height: '540px',
    minHeight: '500px',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.12), 0 0 0 1px #e2e8f0',
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden',
    zIndex: 10,
    position: 'relative',
  },
  leftPane: {
    flex: '1 1 440px',
    width: '50%',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2.5rem 2.25rem',
    boxSizing: 'border-box',
    borderRight: '1px solid #e2e8f0',
  },
  formContent: {
    width: '100%',
    maxWidth: '360px',
  },
  rightPane: {
    flex: '1 1 440px',
    width: '50%',
    height: '100%',
    backgroundColor: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
    padding: '6px',
    boxSizing: 'border-box',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
  },
  brandLogoImg: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    display: 'block',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: '0 0 0.25rem 0',
    letterSpacing: '-0.025em',
  },
  subtitle: {
    fontSize: '0.825rem',
    color: '#64748b',
    margin: 0,
    lineHeight: 1.4,
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    marginBottom: '1rem',
  },
  errorDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#dc2626',
    flexShrink: 0,
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#334155',
    marginBottom: '0.3rem',
  },
  togglePasswordBtn: {
    background: 'none',
    border: 'none',
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 600,
    cursor: 'pointer',
    padding: 0,
  },
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.725rem',
    color: '#94a3b8',
  },
};
