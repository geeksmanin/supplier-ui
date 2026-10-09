import React from 'react';
import { UniversalLoginProps, UserPersonaRole, UniversalLoginFeature } from './UniversalLogin.types';
import { WorkspacePill } from './WorkspacePill';
import { Button } from '../Button';

export interface UniversalLoginDesktopProps extends UniversalLoginProps {
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

export const UniversalLoginDesktop: React.FC<UniversalLoginDesktopProps> = ({
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
  systemBadge,
  themeColor = '#2563eb',
  gradient,
  logoUrl,
  features = [],
}) => {
  const isUniversalMode = role === 'universal';

  // Resolved visuals based on active persona
  const getPersonaConfig = () => {
    switch (activeRole) {
      case 'customer':
        return {
          defaultTitle: 'Customer Portal',
          defaultBadge: 'B2B & CLIENT ACCESS',
          defaultDesc: 'Review order statements, track dispatches, and download VAT/GST invoices.',
          primaryColor: themeColor !== '#2563eb' ? themeColor : '#0284c7',
          grad: gradient || 'linear-gradient(135deg, #0369a1 0%, #0c4a6e 100%)',
          defaultFeatures: [
            { title: 'Self-Serve Orders', description: 'Track order statuses, carton dispatches, and delivery ETAs live.' },
            { title: 'Ledgers & Invoices', description: 'Instant access to statement balances and stamped GST tax invoices.' },
            { title: 'Direct Ticketing', description: 'Raise operational issues and query resolution tickets directly to depot staff.' },
          ],
        };
      case 'vendor':
        return {
          defaultTitle: 'Vendor & Supplier Hub',
          defaultBadge: 'SUPPLIER NETWORK',
          defaultDesc: 'Manage purchase purchase orders, quote RFQs, and coordinate inventory delivery.',
          primaryColor: themeColor !== '#2563eb' ? themeColor : '#4f46e5',
          grad: gradient || 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)',
          defaultFeatures: [
            { title: 'PO Confirmations', description: 'Acknowledge purchase orders and submit estimated dispatch dates.' },
            { title: 'Live Inward Matching', description: 'Instant verification of received GRN lots against your challans.' },
            { title: 'Fast Settlement Reports', description: 'Review accepted batch vouchers and payment release dates.' },
          ],
        };
      case 'staff':
      default:
        return {
          defaultTitle: 'Enterprise Staff Hub',
          defaultBadge: 'SYSTEM OPERATIONS V2.0',
          defaultDesc: 'The unified multi-tenant operating ecosystem for operations, accounts, and teams.',
          primaryColor: themeColor,
          grad: gradient || `linear-gradient(135deg, ${themeColor} 0%, #0f172a 100%)`,
          defaultFeatures: [
            { title: 'Operations Console', description: 'High-throughput inventory, ledger dispatching, and branch workflows.' },
            { title: 'Staff Directory & Chat', description: 'Instant team channels, dispatch updates, and shift communications.' },
            { title: 'Live Activity Feeds', description: 'Real-time order arrival alerts and event stream sync.' },
          ],
        };
    }
  };

  const personaConfig = getPersonaConfig();
  const displayFeatures: UniversalLoginFeature[] = features.length > 0 ? features : personaConfig.defaultFeatures;
  const resolvedBadge = systemBadge || personaConfig.defaultBadge;
  const resolvedTitle = title || personaConfig.defaultTitle;
  const resolvedSubtitle = subtitle || personaConfig.defaultDesc;

  return (
    <div style={styles.container}>
      <style>{`
        .universal-desktop-card {
          box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8);
        }
        .universal-input-focus:focus {
          border-color: ${personaConfig.primaryColor} !important;
          box-shadow: 0 0 0 3px ${personaConfig.primaryColor}22 !important;
        }
        .universal-submit-btn {
          background: ${personaConfig.primaryColor};
          transition: all 0.2s ease;
        }
        .universal-submit-btn:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }
        .universal-submit-btn:active {
          transform: translateY(0);
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

      <div className="universal-desktop-card" style={styles.card}>
        {/* Left Hero Pane */}
        <div style={{ ...styles.leftPane, background: personaConfig.grad }}>
          <div>
            <div style={styles.badgeWrapper}>
              <span style={styles.systemBadge}>{resolvedBadge}</span>
              <WorkspacePill
                workspaceCode={activeWorkspace}
                workspaceName={workspaceName}
                onChangeClick={onOpenWorkspaceModal}
                variant="dark"
              />
            </div>

            <div style={{ margin: '2rem 0' }}>
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={appName || 'Logo'}
                  style={{ maxHeight: '56px', marginBottom: '1.25rem', objectFit: 'contain' }}
                />
              ) : (
                <h1 style={styles.heroTitle}>{appName || 'GEEKSMAN ERP'}</h1>
              )}
              <p style={styles.heroSubtitle}>{resolvedSubtitle}</p>
            </div>

            <div style={styles.featuresList}>
              {displayFeatures.map((feat, idx) => (
                <div key={idx} style={styles.featureItem}>
                  <div style={styles.featureIconBox}>
                    {feat.icon || (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div style={styles.featureHeading}>{feat.title}</div>
                    <div style={styles.featureDesc}>{feat.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.footerNote}>
            <span>Secured with end-to-end multi-tenant isolation</span>
          </div>
        </div>

        {/* Right Sign-in Form Pane */}
        <div style={styles.rightPane}>
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

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <h2 style={styles.formTitle}>{resolvedTitle}</h2>
              <WorkspacePill
                workspaceCode={activeWorkspace}
                workspaceName={workspaceName}
                onChangeClick={onOpenWorkspaceModal}
                variant="light"
              />
            </div>
            <p style={styles.formDesc}>Enter your login credentials to continue.</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <div style={styles.errorDot} />
              <div style={{ flex: 1, fontSize: '0.85rem', color: '#b91c1c', fontWeight: 500 }}>{error}</div>
            </div>
          )}

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label style={styles.label}>Email Address / Username</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  autoFocus
                  className="universal-input-focus"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  style={styles.input}
                />
              </div>
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
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="universal-input-focus"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={styles.input}
                />
              </div>
            </div>

            <Button
              variant="primary"
              type="submit"
              disabled={loading || !email || !password}
              className="universal-submit-btn"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: '10px',
                marginTop: '0.5rem',
              }}
            >
              {loading ? 'Authenticating...' : `Sign In to ${activeWorkspace.toUpperCase()}`}
            </Button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Need to access a different company?{' '}
              <button
                type="button"
                onClick={onOpenWorkspaceModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: personaConfig.primaryColor,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Change Workspace
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    width: '960px',
    minHeight: '580px',
    display: 'flex',
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  leftPane: {
    flex: 1.1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '3rem',
    color: '#ffffff',
    position: 'relative',
  },
  badgeWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  systemBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.725rem',
    fontWeight: 700,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    letterSpacing: '0.05em',
  },
  heroTitle: {
    fontSize: '2.4rem',
    fontWeight: 800,
    margin: '0 0 0.85rem 0',
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
  },
  heroSubtitle: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 1.6,
    maxWidth: '380px',
    margin: 0,
  },
  featuresList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    marginTop: '2rem',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.85rem',
  },
  featureIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: '#ffffff',
  },
  featureHeading: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: '0.15rem',
  },
  featureDesc: {
    fontSize: '0.775rem',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 1.45,
  },
  footerNote: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.6)',
    paddingTop: '1.5rem',
  },
  rightPane: {
    width: '440px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '3rem',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
  },
  segmentedToggle: {
    display: 'flex',
    padding: '0.25rem',
    borderRadius: '10px',
    backgroundColor: '#f1f5f9',
    marginBottom: '1.5rem',
  },
  segmentedBtn: {
    flex: 1,
    padding: '0.45rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#64748b',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  segmentedBtnActive: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
  },
  formTitle: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  formDesc: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: 0,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    marginBottom: '1rem',
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
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: '#ffffff',
    border: '1.5px solid #cbd5e1',
    borderRadius: '10px',
    fontSize: '0.9rem',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.15s ease',
  },
};
