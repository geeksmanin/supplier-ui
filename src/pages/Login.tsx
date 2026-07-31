import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, useMediaQuery } from '@geeksman/core-ui';

export const Login: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [versionData, setVersionData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const showVersionInfo = async () => {
    try {
      const res = await apiClient.get('/version');
      setVersionData(res.data);
      setVersionModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch version info:", err);
      setVersionData({
        commit_hash: "dev",
        commit_message: "Local development build (API offline)",
        deployed_at: new Date().toISOString()
      });
      setVersionModalOpen(true);
    }
  };

  const handleCopy = () => {
    if (versionData) {
      navigator.clipboard.writeText(versionData.commit_hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        showVersionInfo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.post('/contacts/customer/login', { email, password });
      const responseData = res.data?.data || res.data;
      const { token, user } = responseData || {};
      
      if (!token) {
        throw new Error('No authentication token returned from server');
      }

      // Decode JWT to verify SUPPLIER/VENDOR role
      const payloadBase64 = token.split('.')[1];
      const decoded = JSON.parse(atob(payloadBase64));
      const roles = decoded.roles || decoded.role || [];
      const roleList = Array.isArray(roles) ? roles : [roles];
      const isSupplier = roleList.some((r: string) => r.toUpperCase() === 'SUPPLIER' || r.toUpperCase() === 'VENDOR');

      if (!isSupplier) {
        setError('Access denied: Only accounts with the SUPPLIER or VENDOR role can access this portal.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Invalid credentials or login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Left Pane: Calm Deep Blue/Indigo Visuals */}
      {!isMobile && (
        <div style={styles.leftPane}>
          <div onClick={showVersionInfo} title="Click to view version info" style={{ ...styles.logoBadge, cursor: 'pointer' }}>
            <img src="/geeksman-side-logo.png" alt="Geeksman Logo" style={{ height: '36px', objectFit: 'contain' }} />
          </div>

          {/* Dynamic Abstract Art using SVG */}
          <div style={styles.visualWrapper}>
            <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={styles.svgArt}>
              {/* Defs for gradients & filters */}
              <defs>
                <radialGradient id="indigoGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="blueTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <filter id="blurFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="40" />
                </filter>
              </defs>

              {/* Glowing background blob */}
              <circle cx="200" cy="200" r="160" fill="url(#indigoGlow)" filter="url(#blurFilter)" />
              
              {/* Geometric orbital paths */}
              <circle cx="200" cy="200" r="120" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="1.5" strokeDasharray="5 5" />
              <circle cx="200" cy="200" r="90" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="2" />
              <circle cx="200" cy="200" r="60" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />

              {/* Dynamic floating nodes */}
              <circle cx="110" cy="140" r="16" fill="url(#blueTealGrad)" style={{ filter: 'drop-shadow(0 8px 16px rgba(59,130,246,0.3))' }} />
              <circle cx="290" cy="260" r="28" fill="url(#blueTealGrad)" style={{ filter: 'drop-shadow(0 12px 24px rgba(6,182,212,0.4))' }} />
              <circle cx="260" cy="120" r="10" fill="#3b82f6" opacity="0.8" />
              <circle cx="140" cy="280" r="8" fill="#06b6d4" opacity="0.6" />

              {/* Connecting network lines */}
              <line x1="110" y1="140" x2="260" y2="120" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />
              <line x1="290" y1="260" x2="260" y2="120" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />
              <line x1="290" y1="260" x2="140" y2="280" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />
              <line x1="110" y1="140" x2="140" y2="280" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />
            </svg>
          </div>

          <div style={styles.leftFooter}>
            <h2 style={styles.visualTitle}>Supplier Portal</h2>
            <p style={styles.visualSubtitle}>Manage products, respond to RFQs, track purchase orders, and grow your business with Geeksman ERP.</p>
          </div>
        </div>
      )}

      {/* Right Pane: Glassmorphic Login Form */}
      <div style={styles.rightPane}>
        {/* Language selector on top right */}
        <div style={styles.topActionRow}>
          <div style={styles.langSelector}>
            <span>🇺🇸</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>English</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>▼</span>
          </div>
        </div>

        <div style={styles.formCard}>
          <div style={styles.cardHeader}>
            <h1 style={styles.title}>Welcome back! 👋</h1>
            <p style={styles.subtitle}>Enter your login credentials to access the portal.</p>
          </div>

          {error && <div style={styles.errorBanner}>{error}</div>}

          <form onSubmit={handleLogin} style={styles.form}>
            {/* Email Field */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address / Username</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={styles.inputGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Password</label>
                <a href="#/login" style={styles.actionLink}>Forgot Password?</a>
              </div>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={styles.footerRow}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>New to our platform? </span>
            <a href="#/login" style={styles.signupLink}>Create an account</a>
          </div>
        </div>
      </div>

      {versionModalOpen && versionData && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>🚀 System Version Details</h3>
              <button onClick={() => setVersionModalOpen(false)} style={styles.closeBtn}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Commit Hash</span>
                <div style={styles.codeWrapper}>
                  <code style={styles.codeText}>{versionData.commit_hash}</code>
                  <button 
                    onClick={handleCopy} 
                    style={styles.copyBtn}
                    title="Copy Hash"
                  >
                    {copied ? '✅' : '📋'}
                  </button>
                </div>
              </div>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Commit Message</span>
                <p style={styles.commitMsg}>{versionData.commit_message || 'N/A'}</p>
              </div>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Deployed At</span>
                <span style={styles.deployTime}>{new Date(versionData.deployed_at).toLocaleString()}</span>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setVersionModalOpen(false)} style={styles.modalCloseBtn}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    fontFamily: '"Outfit", "Inter", sans-serif',
    color: '#ffffff',
    overflow: 'hidden',
  },
  leftPane: {
    flex: '1 1 50%',
    backgroundColor: '#0f172a',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '3rem',
    boxSizing: 'border-box',
  },
  logoBadge: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.1rem',
    color: '#3b82f6',
  },
  visualWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: '450px',
  },
  svgArt: {
    maxWidth: '380px',
    maxHeight: '380px',
  },
  leftFooter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  visualTitle: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  visualSubtitle: {
    fontSize: '0.95rem',
    color: '#94a3b8',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '480px',
  },
  rightPane: {
    flex: '1 1 50%',
    backgroundColor: '#090d16',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    position: 'relative',
    boxSizing: 'border-box',
  },
  topActionRow: {
    position: 'absolute',
    top: '2.5rem',
    right: '2.5rem',
  },
  langSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '100px',
    padding: '0.4rem 1rem',
    cursor: 'pointer',
  },
  formCard: {
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  cardHeader: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: 800,
    color: '#ffffff',
    margin: '0 0 0.5rem 0',
    letterSpacing: '-0.025em',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#94a3b8',
    margin: 0,
    lineHeight: 1.5,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    borderRadius: '12px',
    padding: '0.85rem 1rem',
    fontSize: '0.85rem',
    lineHeight: 1.4,
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#cbd5e1',
  },
  actionLink: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#3b82f6',
    textDecoration: 'none',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    display: 'flex',
    alignItems: 'center',
    color: '#64748b',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '0.9rem 1rem 0.9rem 2.75rem',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    fontSize: '0.95rem',
    color: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  },
  submitBtn: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '0.5rem',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
    transition: 'all 0.2s ease',
  },
  footerRow: {
    marginTop: '2rem',
    textAlign: 'center',
  },
  signupLink: {
    fontWeight: 600,
    color: '#3b82f6',
    textDecoration: 'none',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modalCard: {
    width: '90%',
    maxWidth: '480px',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    fontFamily: '"Outfit", "Inter", sans-serif',
    color: '#ffffff',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '0.75rem',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#ffffff',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  metaRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    alignItems: 'flex-start',
  },
  metaLabel: {
    fontSize: '0.8rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#64748b',
    letterSpacing: '0.05em',
  },
  codeWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '0.5rem 0.75rem',
    width: '100%',
    boxSizing: 'border-box',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    color: '#3b82f6',
    wordBreak: 'break-all',
    flex: 1,
    textAlign: 'left',
  },
  copyBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: 0,
  },
  commitMsg: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#cbd5e1',
    lineHeight: 1.4,
    textAlign: 'left',
  },
  deployTime: {
    fontSize: '0.9rem',
    color: '#cbd5e1',
    textAlign: 'left',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '0.75rem',
  },
  modalCloseBtn: {
    padding: '0.5rem 1.25rem',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
    transition: 'all 0.2s ease',
  },
};
