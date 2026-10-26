import React from 'react';
import { SystemVersionInfo } from '../../hooks/useSystemVersion';
import { getWorkspaceFromUrl } from '../../api/client';

export interface SystemVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  versionInfo: SystemVersionInfo;
  appName?: string;
}

export const SystemVersionModal: React.FC<SystemVersionModalProps> = ({
  isOpen,
  onClose,
  versionInfo,
  appName = 'Geeksman OS',
}) => {
  if (!isOpen) return null;

  const tenant = getWorkspaceFromUrl() || 'default';
  const {
    webAppVersion,
    swCacheId,
    androidAppVersion,
    androidBuild,
    backendVersion,
    desktopAppVersion,
    activePlatform,
    updateReady,
    checkForUpdates,
    copyDiagnostics,
  } = versionInfo;

  return (
    <div
      onClick={onClose}
      style={styles.backdrop}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={styles.modalCard}
      >
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={styles.appIconWrapper}>
              {(appName || 'G')[0].toUpperCase()}
            </div>
            <div>
              <h3 style={styles.title}>{appName}</h3>
              <p style={styles.subtitle}>Workspace: {tenant.toUpperCase()}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={styles.closeBtn}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* 4 Version Pillars */}
        <div style={styles.content}>
          {/* 1. Web Version Card */}
          <div style={{ ...styles.platformCard, ...(activePlatform === 'web' ? styles.activeCard : {}) }}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitleGroup}>
                <span style={{ fontSize: '1.25rem' }}>🌐</span>
                <div>
                  <div style={styles.platformName}>Web Client</div>
                  <div style={styles.platformDetail}>Service Worker: {swCacheId}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {activePlatform === 'web' && <span style={styles.activeTag}>ACTIVE RUNTIME</span>}
                <span style={styles.versionPill}>{webAppVersion}</span>
              </div>
            </div>
          </div>

          {/* 2. Android Version Card */}
          <div style={{ ...styles.platformCard, ...(activePlatform === 'android' ? styles.activeCard : {}) }}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitleGroup}>
                <span style={{ fontSize: '1.25rem' }}>📱</span>
                <div>
                  <div style={styles.platformName}>Android Application</div>
                  <div style={styles.platformDetail}>
                    {activePlatform === 'android' ? 'Native Shell Package' : 'APK Release Package'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {activePlatform === 'android' && <span style={styles.activeTag}>ACTIVE RUNTIME</span>}
                <span style={styles.versionPill}>
                  {androidAppVersion ? `${androidAppVersion}${androidBuild ? ` (${androidBuild})` : ''}` : 'Pending Build'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Desktop Version Card */}
          <div style={{ ...styles.platformCard, ...(activePlatform === 'desktop' ? styles.activeCard : {}) }}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitleGroup}>
                <span style={{ fontSize: '1.25rem' }}>🖥️</span>
                <div>
                  <div style={styles.platformName}>Desktop Application</div>
                  <div style={styles.platformDetail}>
                    {activePlatform === 'desktop' ? 'Native Wails Binary' : 'Cross-Platform Package'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {activePlatform === 'desktop' && <span style={styles.activeTag}>ACTIVE RUNTIME</span>}
                <span style={styles.versionPill}>{desktopAppVersion || 'Desktop Ready'}</span>
              </div>
            </div>
          </div>

          {/* 4. Backend Version Card */}
          <div style={styles.platformCard}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitleGroup}>
                <span style={{ fontSize: '1.25rem' }}>⚡</span>
                <div>
                  <div style={styles.platformName}>Backend API</div>
                  <div style={styles.platformDetail}>
                    Deployed: {backendVersion?.deployed_at ? new Date(backendVersion.deployed_at).toLocaleDateString() : 'Active'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ ...styles.versionPill, fontFamily: 'monospace' }}>
                  {backendVersion?.commit_hash ? backendVersion.commit_hash.slice(0, 7) : 'Live'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={styles.footer}>
          <button
            type="button"
            onClick={copyDiagnostics}
            style={styles.secondaryBtn}
          >
            📋 Copy Diagnostics
          </button>

          <button
            type="button"
            onClick={checkForUpdates}
            style={styles.primaryBtn}
          >
            {updateReady ? '⚡ Update & Reload' : '🔄 Check for Updates'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    padding: '1rem',
    fontFamily: '"Outfit", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  modalCard: {
    width: '100%',
    maxWidth: '520px',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fafafa',
  },
  appIconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
  },
  title: {
    margin: 0,
    fontSize: '1.05rem',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    margin: '0.15rem 0 0 0',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#64748b',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '0.35rem',
  },
  content: {
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  platformCard: {
    padding: '0.85rem 1rem',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    transition: 'all 0.15s ease',
  },
  activeCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  platformName: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#0f172a',
  },
  platformDetail: {
    fontSize: '0.725rem',
    color: '#64748b',
    marginTop: '0.1rem',
  },
  versionPill: {
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 700,
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    color: '#0f172a',
  },
  activeTag: {
    padding: '0.15rem 0.45rem',
    borderRadius: '6px',
    fontSize: '0.65rem',
    fontWeight: 800,
    backgroundColor: '#dcfce7',
    color: '#15803d',
    letterSpacing: '0.04em',
  },
  footer: {
    padding: '1rem 1.5rem',
    backgroundColor: '#fafafa',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
  },
  secondaryBtn: {
    padding: '0.6rem 1rem',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#334155',
    cursor: 'pointer',
  },
  primaryBtn: {
    padding: '0.6rem 1.15rem',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#0f172a',
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#ffffff',
    cursor: 'pointer',
  },
};
