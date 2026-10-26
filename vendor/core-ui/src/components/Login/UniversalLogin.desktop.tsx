import React, { useState } from 'react';
import { UniversalLoginProps, UserPersonaRole, UniversalLoginFeature } from './UniversalLogin.types';
import { WorkspacePill } from './WorkspacePill';
import { LoginVersionFooter } from './LoginVersionFooter';
import { Button } from '../Button';
import { GalaxyLoader } from '../GalaxyLoader';

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
  onOpenWorkspaceModal?: () => void;
  onWorkspaceChange?: (newCode: string, metadata?: any) => void;
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
  workspaceLogo,
  onOpenWorkspaceModal,
  onWorkspaceChange,
  onSubmit,
  role = 'staff',
  appName,
  title,
  subtitle,
  systemBadge,
  themeColor = '#2563eb',
  backgroundColor,
  gradient,
  logoUrl,
  layout = 'loader',
  loaderTheme = 'light',
  features = [],
}) => {
  const isUniversalMode = role === 'universal';
  const [logoError, setLogoError] = useState(false);

  // Resolved logo URL: explicit prop -> workspaceLogo -> localStorage -> /logo.png
  const resolvedLogo =
    !logoError &&
    (logoUrl ||
      workspaceLogo ||
      (typeof window !== 'undefined' ? localStorage.getItem('tenant_logo_url') : null) ||
      '/logo.png');

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
          defaultDesc: 'Manage purchase orders, quote RFQs, and coordinate inventory delivery.',
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
  const resolvedTitle = title || appName || personaConfig.defaultTitle;
  const resolvedSubtitle = subtitle || personaConfig.defaultDesc;

  return (
    <div style={{ ...styles.container, backgroundColor: backgroundColor || '#f1f5f9' }}>
      <style>{`
        .universal-login-input {
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
        .universal-login-input:focus {
          border-color: ${personaConfig.primaryColor};
          box-shadow: 0 0 0 3px ${personaConfig.primaryColor}22;
        }
        .universal-submit-btn {
          width: 100%;
          padding: 0.825rem;
          border-radius: 10px;
          font-size: 0.925rem;
          font-weight: 700;
          color: #ffffff;
          background-color: ${personaConfig.primaryColor};
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
          box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.1);
        }
        .universal-submit-btn:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
          box-shadow: 0 6px 12px -1px rgba(15, 23, 42, 0.15);
        }
        .universal-submit-btn:active {
          transform: scale(0.98);
        }
        .universal-submit-btn:disabled {
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

      {/* Mode 1: Loader Layout (Split Card with 3D Geeksman Dome Particle Canvas) */}
      {layout === 'loader' ? (
        <div style={styles.cardBoxLoader}>
          {/* Left Half: Credentials & Workspace Selection */}
          <div style={styles.leftPaneLoader}>
            <div style={styles.formContentLoader}>
              {/* Branding Header */}
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={styles.brandIconWrapper}>
                  {resolvedLogo ? (
                    <img
                      src={resolvedLogo}
                      alt={appName || 'Logo'}
                      style={styles.brandLogoImg}
                      onError={() => {
                        if (!logoError) setLogoError(true);
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: personaConfig.primaryColor,
                        fontWeight: 800,
                        fontSize: '1.2rem',
                      }}
                    >
                      {(appName || 'G')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <h1 style={styles.titleLoader}>{appName || resolvedTitle}</h1>
                <p style={styles.subtitleLoader}>{resolvedSubtitle}</p>
              </div>

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

              {error && (
                <div style={styles.errorAlert}>
                  <span style={styles.errorDot} />
                  <span style={{ flex: 1, fontSize: '0.8rem', color: '#b91c1c', fontWeight: 500 }}>
                    {error}
                  </span>
                </div>
              )}

              <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                {/* Workspace Indicator directly above Email field */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.2rem' }}>
                  <WorkspacePill
                    workspaceCode={activeWorkspace}
                    workspaceName={workspaceName}
                    onChangeClick={onOpenWorkspaceModal}
                    onWorkspaceChange={onWorkspaceChange}
                    variant="light"
                  />
                </div>

                <div>
                  <label style={styles.label}>Email Address or Username</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    className="universal-login-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
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
                    className="universal-login-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="universal-submit-btn"
                  style={{ marginTop: '0.35rem' }}
                >
                  {loading ? 'Authenticating...' : `Sign In`}
                </button>
              </form>

              <div style={styles.footerNoteLoader}>
                <span>Secured with end-to-end multi-tenant isolation</span>
              </div>

              <LoginVersionFooter appName={appName} theme="light" />
            </div>
          </div>

          {/* Right Half: 3D Geeksman Dome Particle Canvas */}
          <div style={styles.rightPaneLoader}>
            <GalaxyLoader fullscreen={false} theme={loaderTheme} />
          </div>
        </div>
      ) : (
        /* Mode 2: Hero Layout (Gradient Hero Left Pane + Form Right Pane) */
        <div style={styles.cardBoxHero}>
          {/* Left Hero Pane */}
          <div style={{ ...styles.leftPaneHero, background: personaConfig.grad }}>
            <div>
              <div style={styles.badgeWrapperHero}>
                <span style={styles.systemBadgeHero}>{resolvedBadge}</span>
                <WorkspacePill
                  workspaceCode={activeWorkspace}
                  workspaceName={workspaceName}
                  onChangeClick={onOpenWorkspaceModal}
                  onWorkspaceChange={onWorkspaceChange}
                  variant="dark"
                />
              </div>

              <div style={{ margin: '2rem 0' }}>
                {resolvedLogo ? (
                  <img
                    src={resolvedLogo}
                    alt={appName || 'Logo'}
                    style={{ maxHeight: '52px', marginBottom: '1.25rem', objectFit: 'contain' }}
                  />
                ) : (
                  <h1 style={styles.heroTitle}>{appName || 'GEEKSMAN ERP'}</h1>
                )}
                <p style={styles.heroSubtitle}>{resolvedSubtitle}</p>
              </div>

              <div style={styles.featuresListHero}>
                {displayFeatures.map((feat, idx) => (
                  <div key={idx} style={styles.featureItemHero}>
                    <div style={styles.featureIconBoxHero}>
                      {feat.icon || (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div style={styles.featureHeadingHero}>{feat.title}</div>
                      <div style={styles.featureDescHero}>{feat.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.footerNoteHero}>
              <span>Secured with end-to-end multi-tenant isolation</span>
            </div>
          </div>

          {/* Right Form Pane */}
          <div style={styles.rightPaneHero}>
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
                <h2 style={styles.formTitleHero}>{resolvedTitle}</h2>
                <WorkspacePill
                  workspaceCode={activeWorkspace}
                  workspaceName={workspaceName}
                  onChangeClick={onOpenWorkspaceModal}
                  onWorkspaceChange={onWorkspaceChange}
                  variant="light"
                />
              </div>
              <p style={styles.formDescHero}>Enter your login credentials to continue.</p>
            </div>

            {error && (
              <div style={styles.errorAlert}>
                <span style={styles.errorDot} />
                <span style={{ flex: 1, fontSize: '0.85rem', color: '#b91c1c', fontWeight: 500 }}>{error}</span>
              </div>
            )}

            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label style={styles.label}>Email Address / Username</label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="universal-login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
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
                  className="universal-login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
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

            <LoginVersionFooter appName={appName} theme="light" />
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1.5rem',
    boxSizing: 'border-box',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  cardBoxLoader: {
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
  leftPaneLoader: {
    flex: '1 1 440px',
    width: '50%',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem 2.25rem',
    boxSizing: 'border-box',
    borderRight: '1px solid #e2e8f0',
  },
  formContentLoader: {
    width: '100%',
    maxWidth: '360px',
  },
  rightPaneLoader: {
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
  titleLoader: {
    fontSize: '1.45rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: '0 0 0.25rem 0',
    letterSpacing: '-0.025em',
  },
  subtitleLoader: {
    fontSize: '0.825rem',
    color: '#64748b',
    margin: 0,
    lineHeight: 1.4,
  },
  footerNoteLoader: {
    marginTop: '1.25rem',
    textAlign: 'center',
    fontSize: '0.725rem',
    color: '#94a3b8',
  },
  cardBoxHero: {
    width: '960px',
    minHeight: '580px',
    display: 'flex',
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)',
  },
  leftPaneHero: {
    flex: 1.1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '3rem',
    color: '#ffffff',
    position: 'relative',
  },
  badgeWrapperHero: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  systemBadgeHero: {
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
  featuresListHero: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    marginTop: '2rem',
  },
  featureItemHero: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.85rem',
  },
  featureIconBoxHero: {
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
  featureHeadingHero: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: '0.15rem',
  },
  featureDescHero: {
    fontSize: '0.775rem',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 1.45,
  },
  footerNoteHero: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.6)',
    paddingTop: '1.5rem',
  },
  rightPaneHero: {
    width: '440px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '3rem',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
  },
  formTitleHero: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  formDescHero: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: 0,
  },
  segmentedToggle: {
    display: 'flex',
    padding: '0.25rem',
    borderRadius: '10px',
    backgroundColor: '#f1f5f9',
    marginBottom: '1.25rem',
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
    marginBottom: '0.25rem',
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
};
