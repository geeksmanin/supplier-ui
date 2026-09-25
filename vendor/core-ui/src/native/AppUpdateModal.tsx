import React from 'react';
import { useAppUpdater, UseAppUpdaterOptions } from './useAppUpdater';

export interface AppUpdateModalProps extends UseAppUpdaterOptions {
  appName?: string;
  updater?: ReturnType<typeof useAppUpdater>;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  appName = 'App',
  updater: externalUpdater,
  ...options
}) => {
  const internalUpdater = useAppUpdater(options);
  const updater = externalUpdater || internalUpdater;

  const {
    updateAvailable,
    isMandatory,
    installedVersion,
    latestVersion,
    changelog,
    isDownloading,
    downloadProgress,
    error,
    downloadAndInstall,
    dismissUpdate,
  } = updater;

  if (!updateAvailable) {
    return null;
  }

  // 1. Mandatory Update Full-Screen Modal
  if (isMandatory) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '1.25rem',
          fontFamily: '"Outfit", "Inter", system-ui, -apple-system, sans-serif',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'center',
            padding: '2rem 1.75rem 1.75rem',
          }}
        >
          {/* Animated Rocket Icon Badge */}
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '22px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              margin: '0 auto 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 10px 25px rgba(239, 68, 68, 0.35)',
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.35 22.35 0 0 1-3.95 2z"></path>
              <path d="M9 12H4s.55-3.03 2-4.5c1.47-1.47 4.5-2 4.5-2"></path>
              <path d="M15 15v5s3.03-.55 4.5-2c1.47-1.47 2-4.5 2-4.5"></path>
            </svg>
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
            Update Required
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
            A critical update for <strong>{appName}</strong> is required to ensure system compatibility and data integrity.
          </p>

          {/* Version Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#64748b',
                background: '#f1f5f9',
                padding: '4px 10px',
                borderRadius: '8px',
              }}
            >
              Current: v{installedVersion}
            </div>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>➔</span>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#16a34a',
                background: '#dcfce7',
                padding: '4px 10px',
                borderRadius: '8px',
              }}
            >
              Latest: v{latestVersion}
            </div>
          </div>

          {/* Changelog Box */}
          {changelog && (
            <div
              style={{
                textAlign: 'left',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                maxHeight: '120px',
                overflowY: 'auto',
                fontSize: '0.82rem',
                color: '#334155',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.4,
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                What&apos;s New
              </div>
              {changelog}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.82rem',
                marginBottom: '1rem',
                textAlign: 'left',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Progress Bar when downloading */}
          {isDownloading ? (
            <div style={{ margin: '0.5rem 0 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                <span>Downloading update...</span>
                <span>{downloadProgress}%</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '10px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${downloadProgress}%`,
                    background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                    borderRadius: '999px',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                The package installer will launch automatically.
              </div>
            </div>
          ) : (
            <button
              onClick={downloadAndInstall}
              style={{
                width: '100%',
                padding: '0.85rem 1.25rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Download & Install v{latestVersion}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. Non-Mandatory Top Update Notification Card
  return (
    <div
      style={{
        position: 'fixed',
        top: '12px',
        left: '16px',
        right: '16px',
        maxWidth: '460px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #bfdbfe',
        boxShadow: '0 12px 30px -5px rgba(37, 99, 235, 0.25)',
        zIndex: 99999,
        padding: '0.9rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        fontFamily: '"Outfit", "Inter", system-ui, -apple-system, sans-serif',
        animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
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
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.35 22.35 0 0 1-3.95 2z"></path>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
              Update Available (v{latestVersion})
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              A new version of {appName} is ready to install
            </div>
          </div>
        </div>

        <button
          onClick={dismissUpdate}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Dismiss"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {isDownloading ? (
        <div style={{ marginTop: '0.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
            <span>Downloading...</span>
            <span>{downloadProgress}%</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#e2e8f0',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${downloadProgress}%`,
                background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                borderRadius: '999px',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
          <button
            onClick={downloadAndInstall}
            style={{
              flex: 1,
              padding: '0.55rem 0.85rem',
              borderRadius: '10px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <span>Update Now</span>
          </button>
          <button
            onClick={dismissUpdate}
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: '10px',
              background: '#f1f5f9',
              color: '#475569',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            Later
          </button>
        </div>
      )}
    </div>
  );
};
