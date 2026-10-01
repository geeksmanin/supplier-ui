import React, { useState } from 'react';
import { AppUpdateBannerProps } from './types';

export const AppUpdateBannerMobile: React.FC<AppUpdateBannerProps> = ({
  appName = 'App',
  version,
  isOpen = true,
  onClose,
  onUpdateNow,
  changelog,
  isDownloading = false,
  downloadProgress = 0,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = () => {
    setIsUpdating(true);
    if (onUpdateNow) {
      onUpdateNow();
      return;
    }

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg?.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }).catch(() => {
        window.location.reload();
      });
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div
      role="alertdialog"
      aria-label="Update Available"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        backgroundColor: '#ffffff',
        borderTopLeftRadius: '22px',
        borderTopRightRadius: '22px',
        borderTop: '2px solid #3b82f6',
        boxShadow: '0 -12px 45px rgba(37, 99, 235, 0.22)',
        padding: '0.9rem 1.15rem max(1rem, env(safe-area-inset-bottom))',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        fontFamily: '"Outfit", "Inter", system-ui, -apple-system, sans-serif',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Top Handlebar */}
      <div
        style={{
          width: '36px',
          height: '4px',
          backgroundColor: '#cbd5e1',
          borderRadius: '999px',
          margin: '0 auto -0.1rem',
        }}
      />

      {/* Content Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 6px 16px rgba(37, 99, 235, 0.35)',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          {/* Rocket Icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.35 22.35 0 0 1-3.95 2z" />
            <path d="M9 12H4s.55-3.03 2-4.5c1.47-1.47 4.5-2 4.5-2" />
            <path d="M15 15v5s3.03-.55 4.5-2c1.47-1.47 2-4.5 2-4.5" />
          </svg>
          {/* Pulse Dot */}
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              border: '2px solid #ffffff',
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
              New Update Ready
            </h4>
            {version && (
              <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#16a34a', padding: '1px 6px', borderRadius: '6px' }}>
                {version}
              </span>
            )}
          </div>
          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.3 }}>
            A new version of {appName} is available. Tap to reload with latest fixes.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="Dismiss update"
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '999px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {changelog && (
        <div style={{ fontSize: '0.74rem', color: '#475569', backgroundColor: '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: '8px', maxHeight: '60px', overflowY: 'auto' }}>
          {changelog}
        </div>
      )}

      {isDownloading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>
            <span>Downloading update...</span>
            <span>{downloadProgress}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${downloadProgress}%`, height: '100%', background: '#2563eb', transition: 'width 0.2s' }} />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.55rem', marginTop: '0.1rem' }}>
          <button
            type="button"
            onClick={handleUpdate}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.7rem 1rem',
              borderRadius: '12px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>{isUpdating ? 'Updating...' : 'Update & Reload'}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.7rem 1rem',
                borderRadius: '12px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              Later
            </button>
          )}
        </div>
      )}
    </div>
  );
};
