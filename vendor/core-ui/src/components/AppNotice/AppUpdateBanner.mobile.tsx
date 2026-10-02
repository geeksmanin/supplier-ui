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
  updateType = 'auto',
  apkDownloadUrl = '/downloads/samvad.apk',
  onDownloadApk,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [downloadDownloaded, setDownloadDownloaded] = useState(false);

  if (!isOpen) return null;

  const isApkMode = updateType === 'apk' || (updateType === 'auto' && Boolean(apkDownloadUrl));

  const handleUpdate = () => {
    setIsUpdating(true);
    if (onUpdateNow) {
      onUpdateNow();
      return;
    }

    if (isApkMode) {
      if (onDownloadApk) onDownloadApk();
      // Trigger direct APK download / open package installer
      if (typeof window !== 'undefined') {
        const link = document.createElement('a');
        link.href = apkDownloadUrl;
        link.setAttribute('download', apkDownloadUrl.split('/').pop() || 'samvad.apk');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadDownloaded(true);
      }
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
        borderTop: isApkMode ? '2px solid #16a34a' : '2px solid #3b82f6',
        boxShadow: isApkMode ? '0 -12px 45px rgba(22, 163, 74, 0.22)' : '0 -12px 45px rgba(37, 99, 235, 0.22)',
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
            background: isApkMode
              ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
              : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: isApkMode ? '0 6px 16px rgba(22, 163, 74, 0.35)' : '0 6px 16px rgba(37, 99, 235, 0.35)',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          {isApkMode ? (
            /* Android / APK Package Icon */
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          ) : (
            /* Rocket Icon for OTA Web */
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.35 22.35 0 0 1-3.95 2z" />
              <path d="M9 12H4s.55-3.03 2-4.5c1.47-1.47 4.5-2 4.5-2" />
              <path d="M15 15v5s3.03-.55 4.5-2c1.47-1.47 2-4.5 2-4.5" />
            </svg>
          )}
          {/* Pulse Dot */}
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: isApkMode ? '#22c55e' : '#10b981',
              border: '2px solid #ffffff',
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
              {isApkMode ? 'Android APK Update' : 'Live Web Update Ready'}
            </h4>
            {version && (
              <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: isApkMode ? '#dcfce7' : '#dbeafe', color: isApkMode ? '#15803d' : '#1d4ed8', padding: '1px 6px', borderRadius: '6px' }}>
                {isApkMode ? `APK ${version}` : version}
              </span>
            )}
          </div>
          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.3 }}>
            {isApkMode
              ? `New Android release package (${version || 'latest'}) is ready for download & installation.`
              : `A new version of ${appName} is ready. Tap to reload and apply instant fixes.`}
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

      {isApkMode && downloadDownloaded && (
        <div style={{ fontSize: '0.74rem', color: '#15803d', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.5rem 0.75rem', borderRadius: '8px', lineHeight: 1.35 }}>
          <strong style={{ display: 'block', marginBottom: '2px' }}>✅ APK Download Triggered!</strong>
          Tap "Open" on your browser's download notification, or open your Downloads folder to install <strong>samvad.apk</strong>. If prompted, allow "Install from Unknown Sources".
        </div>
      )}

      {isDownloading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>
            <span>Downloading APK package...</span>
            <span>{downloadProgress}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${downloadProgress}%`, height: '100%', background: '#16a34a', transition: 'width 0.2s' }} />
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
              backgroundColor: isApkMode ? '#16a34a' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: isApkMode ? '0 4px 14px rgba(22, 163, 74, 0.3)' : '0 4px 14px rgba(37, 99, 235, 0.3)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>
              {isUpdating
                ? 'Processing...'
                : isApkMode
                ? downloadDownloaded
                  ? 'Re-download & Install APK'
                  : 'Download & Install APK'
                : 'Reload & Apply Update'}
            </span>
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
