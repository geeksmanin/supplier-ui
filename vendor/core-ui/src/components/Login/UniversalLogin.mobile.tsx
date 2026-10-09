import React from 'react';
import { UniversalLoginProps, UserPersonaRole } from './UniversalLogin.types';
import { WorkspacePill } from './WorkspacePill';
import { Button } from '../Button';

export interface UniversalLoginMobileProps extends UniversalLoginProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  loading: boolean;
  error: string | null;
  activeRole: UserPersonaRole;
  setActiveRole: (role: UserPersonaRole) => void;
  activeWorkspace: string;
  workspaceName?: string;
  onOpenWorkspaceModal: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const UniversalLoginMobile: React.FC<UniversalLoginMobileProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loading,
  error,
  activeRole,
  setActiveRole,
  activeWorkspace,
  workspaceName,
  onOpenWorkspaceModal,
  onSubmit,
  role = 'staff',
  appName,
  title,
  subtitle,
  themeColor = '#2563eb',
  logoUrl,
}) => {
  const isUniversalMode = role === 'universal';

  const getPersonaTheme = () => {
    switch (activeRole) {
      case 'customer':
        return {
          defaultTitle: 'Customer Sign In',
          primaryColor: themeColor !== '#2563eb' ? themeColor : '#0284c7',
        };
      case 'vendor':
        return {
          defaultTitle: 'Supplier Portal Sign In',
          primaryColor: themeColor !== '#2563eb' ? themeColor : '#4f46e5',
        };
      case 'staff':
      default:
        return {
          defaultTitle: 'Staff Operations Sign In',
          primaryColor: themeColor,
        };
    }
  };

  const personaTheme = getPersonaTheme();
  const resolvedTitle = title || personaTheme.defaultTitle;

  return (
    <div style={styles.mobileContainer}>
      <style>{`
        .universal-mobile-input:focus {
          border-color: ${personaTheme.primaryColor} !important;
          box-shadow: 0 0 0 3px ${personaTheme.primaryColor}22 !important;
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

      {/* Header Branding */}
      <div style={styles.mobileHeader}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
          {logoUrl ? (
            <img src={logoUrl} alt={appName || 'Logo'} style={{ maxHeight: '44px', objectFit: 'contain' }} />
          ) : (
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: personaTheme.primaryColor,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 800,
                boxShadow: `0 8px 16px -4px ${personaTheme.primaryColor}66`,
              }}
            >
              {(appName || 'G')[0].toUpperCase()}
            </div>
          )}
        </div>

        <h1 style={styles.appTitle}>{appName || 'GEEKSMAN ERP'}</h1>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.65rem' }}>
          <WorkspacePill
            workspaceCode={activeWorkspace}
            workspaceName={workspaceName}
            onChangeClick={onOpenWorkspaceModal}
            variant="glass"
          />
        </div>
      </div>

      {/* Form Card Drawer */}
      <div style={styles.mobileCard}>
        {/* Universal Persona Segmented Toggle */}
        {isUniversalMode && (
          <div style={styles.segmentedToggle}>
            {(['staff', 'customer', 'vendor'] as UserPersonaRole[]).map((pRole) => (
              <button
                key={pRole}
                type="button"
                onClick={() => setActiveRole(pRole)}
                style={{
                  ...styles.segmentedBtn,
                  ...(activeRole === pRole ? styles.segmentedBtnActive : {}),
                }}
              >
                {pRole.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={styles.formTitle}>{resolvedTitle}</h2>
          <p style={styles.formSubtitle}>{subtitle || 'Sign in with your workspace credentials'}</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <div style={styles.errorDot} />
            <div style={{ flex: 1, fontSize: '0.8rem', color: '#b91c1c', fontWeight: 500 }}>{error}</div>
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={styles.label}>Email Address / Username</label>
            <input
              type="text"
              required
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              className="universal-mobile-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              style={styles.input}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={styles.label}>Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.75rem',
                  color: '#64748b',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="universal-mobile-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
            />
          </div>

          <Button
            variant="primary"
            type="submit"
            disabled={loading || !email || !password}
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              borderRadius: '12px',
              backgroundColor: personaTheme.primaryColor,
              marginTop: '0.5rem',
            }}
          >
            {loading ? 'Authenticating...' : `Sign In`}
          </Button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <button
            type="button"
            onClick={onOpenWorkspaceModal}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Change Workspace ({activeWorkspace.toUpperCase()})
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  mobileContainer: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '1.5rem 1rem 2rem',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  mobileHeader: {
    padding: '1rem 0',
    textAlign: 'center',
  },
  appTitle: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  mobileCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '1.5rem',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
  },
  segmentedToggle: {
    display: 'flex',
    padding: '0.2rem',
    borderRadius: '10px',
    backgroundColor: '#f1f5f9',
    marginBottom: '1.25rem',
  },
  segmentedBtn: {
    flex: 1,
    padding: '0.4rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.725rem',
    fontWeight: 700,
    color: '#64748b',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  segmentedBtnActive: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
  },
  formTitle: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: '0 0 0.25rem 0',
  },
  formSubtitle: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: 0,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 0.85rem',
    borderRadius: '10px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    marginBottom: '1rem',
  },
  errorDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#dc2626',
    flexShrink: 0,
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#334155',
    marginBottom: '0.35rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem 0.85rem',
    backgroundColor: '#ffffff',
    border: '1.5px solid #cbd5e1',
    borderRadius: '10px',
    fontSize: '0.9rem',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
  },
};
