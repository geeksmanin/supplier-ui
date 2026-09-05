import React from 'react';
import { BackendVersionData } from '../hooks/useAppVersion';
import { getWorkspaceFromUrl } from '../api/client';

export interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  uiVersion: string;
  cacheId: string;
  backendVersion: BackendVersionData | null;
  onCheckUpdates: () => void;
  onCopyInfo: () => void;
  updateReady?: boolean;
}

export const VersionModal: React.FC<VersionModalProps> = ({
  isOpen,
  onClose,
  uiVersion,
  cacheId,
  backendVersion,
  onCheckUpdates,
  onCopyInfo,
  updateReady = false,
}) => {
  if (!isOpen) return null;

  const tenant = getWorkspaceFromUrl() || 'default';
  const isDesktopShell = typeof window !== 'undefined' && !!(window as any).wails;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
        fontFamily: '"Outfit", "Inter", system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.1rem 1.4rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', letterSpacing: '-0.01em' }}>
                System & Version Info
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Active Build & Environment Status
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'all 0.15s',
            }}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.25rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          
          {/* Frontend Section */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.9rem 1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563eb' }}>
                🎨 Frontend User Interface
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  backgroundColor: updateReady ? '#fee2e2' : '#dcfce7',
                  color: updateReady ? '#b91c1c' : '#15803d',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                }}
              >
                {updateReady ? '⚡ Update Available' : '● Live / Active'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Version:</span>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{uiVersion}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Cache ID:</span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#334155', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                {cacheId}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Runtime Shell:</span>
              <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                {isDesktopShell ? '🖥️ Desktop App (Wails)' : '🌐 Web PWA'}
              </span>
            </div>
          </div>

          {/* Backend Section */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.9rem 1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0891b2' }}>
                ⚙️ Backend API Service
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                Tenant: <b style={{ color: '#0f172a' }}>{tenant.toUpperCase()}</b>
              </span>
            </div>

            {backendVersion ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0' }}>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Commit:</span>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#2563eb', fontWeight: 700 }}>
                    {backendVersion.commit_hash ? backendVersion.commit_hash.slice(0, 10) : 'N/A'}
                  </span>
                </div>

                {backendVersion.deployed_at && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0' }}>
                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Deployed:</span>
                    <span style={{ fontSize: '0.78rem', color: '#334155' }}>
                      {new Date(backendVersion.deployed_at).toLocaleString()}
                    </span>
                  </div>
                )}

                {backendVersion.commit_message && (
                  <div style={{ marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px dashed #e2e8f0', fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Message: {backendVersion.commit_message.split('\n')[0]}
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', padding: '0.4rem 0' }}>
                Connecting to backend version API...
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '0.85rem 1.4rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.6rem',
          }}
        >
          <button
            onClick={onCopyInfo}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
            title="Copy all system version info for debug/support"
          >
            📋 Copy Diagnostics
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onCheckUpdates}
              style={{
                background: '#2563eb',
                border: 'none',
                borderRadius: '8px',
                padding: '0.45rem 1rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.35)',
              }}
            >
              🔄 Check Updates & Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
