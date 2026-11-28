import React from 'react';
import { WorkspacePill, GalaxyLoader } from '@geeksman/core-ui';

export interface LoginMobileProps {
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

export const LoginMobile: React.FC<LoginMobileProps> = ({
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
  onOpenWorkspaceModal,
  onWorkspaceChange,
  onSubmit,
}) => {
  return (
    <div
      style={{
        ...styles.root,
        justifyContent: 'space-between',
        padding: '1.5rem 1.25rem 2rem 1.25rem',
      }}
    >
      <style>{`
        .erp-mobile-input {
          width: 100%;
          padding: 0.9rem 1rem;
          background-color: #f8fafc;
          border: 1.5px solid #cbd5e1;
          border-radius: 14px;
          font-size: 0.975rem;
          color: #0f172a;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        .erp-mobile-input:focus {
          border-color: #2563eb;
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
        .erp-mobile-submit-btn {
          width: 100%;
          padding: 1rem;
          border-radius: 14px;
          font-size: 1rem;
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
          box-shadow: 0 8px 16px -2px rgba(15, 23, 42, 0.15);
        }
        .erp-mobile-submit-btn:hover {
          background-color: #1e293b;
        }
        .erp-mobile-submit-btn:active {
          transform: scale(0.99);
        }
        .erp-mobile-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div style={{ ...styles.content, justifyContent: 'space-between' }}>
        {/* Mobile Header Branding with Galaxy Particle Dome */}
        <div
          style={{
            ...styles.header,
            marginBottom: '1rem',
            padding: 0,
            flex: '1 1 auto',
            minHeight: '260px',
          }}
        >
          <div style={styles.loaderWrapper}>
            <GalaxyLoader
              fullscreen={false}
              theme="light"
              backgroundColor="transparent"
              minHeight="260px"
            />
          </div>
        </div>

        {/* Mobile Form Card */}
        <div style={{ ...styles.card, padding: '1.85rem 1.5rem 2.25rem 1.5rem' }}>
          {error && (
            <div style={styles.errorAlert}>
              <span style={styles.errorDot} />
              <span style={{ flex: 1, fontSize: '0.825rem', color: '#b91c1c', fontWeight: 500 }}>
                {error}
              </span>
            </div>
          )}

          <form
            onSubmit={onSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}
          >
            {/* Workspace Pill directly above Email field */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.15rem' }}>
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
                className="erp-mobile-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@company.com"
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
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
                className="erp-mobile-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="erp-mobile-submit-btn"
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={styles.footer}>
            <span>Secured with end-to-end multi-tenant isolation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100dvh',
    height: '100dvh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    boxSizing: 'border-box',
    position: 'relative',
    overflowY: 'auto',
    overflowX: 'hidden',
    WebkitOverflowScrolling: 'touch',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  content: {
    width: '100%',
    maxWidth: '420px',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    justifyContent: 'space-between',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1rem',
    position: 'relative',
    overflow: 'hidden',
    padding: '1.25rem 0 0.5rem 0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    overflow: 'hidden',
    pointerEvents: 'none',
    opacity: 0.85,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '1.85rem 1.5rem 2.25rem 1.5rem',
    boxShadow: '0 12px 35px -5px rgba(15, 23, 42, 0.08), 0 0 0 1px #e2e8f0',
    border: '1px solid #e2e8f0',
    boxSizing: 'border-box',
    width: '100%',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    marginBottom: '1.25rem',
  },
  errorDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#dc2626',
    flexShrink: 0,
  },
  label: {
    display: 'block',
    fontSize: '0.825rem',
    fontWeight: 700,
    color: '#334155',
    marginBottom: '0.35rem',
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
    marginTop: '1.75rem',
    textAlign: 'center',
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
};
