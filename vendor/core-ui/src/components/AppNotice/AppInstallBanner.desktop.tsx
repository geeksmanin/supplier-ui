import React, { useState } from 'react';
import { AppInstallBannerProps } from './types';
import { useAppInstallPrompt } from './useAppInstallPrompt';

export const AppInstallBannerDesktop: React.FC<AppInstallBannerProps> = ({
  appName = 'App',
  appSubtitle,
  appIcon,
  hasNativeApk = false,
  apkDownloadUrl = '/downloads/app.apk',
  desktopInstallVariant = 'floating-top-right',
  dismissStorageKey,
  snoozeHours = 24,
  onInstallPwa,
  onDownloadApk,
  forceShowInstall = false,
  isOpen: controlledIsOpen,
  onClose,
}) => {
  const [downloadingApk, setDownloadingApk] = useState(false);

  const {
    isStandalone,
    isDismissed,
    installPwa,
    downloadApk,
    dismiss,
    instructionText,
  } = useAppInstallPrompt({
    dismissStorageKey,
    snoozeHours,
    hasNativeApk,
    apkDownloadUrl,
    onInstallPwa,
    onDownloadApk,
  });

  const isVisible =
    forceShowInstall ||
    (controlledIsOpen !== undefined ? controlledIsOpen : !isStandalone && !isDismissed);

  if (!isVisible) return null;

  const handleClose = () => {
    if (onClose) onClose();
    dismiss();
  };

  const handleDownloadApkClick = () => {
    setDownloadingApk(true);
    downloadApk();
    setTimeout(() => {
      setDownloadingApk(false);
      handleClose();
    }, 1800);
  };

  const handleInstallPwaClick = async () => {
    const installed = await installPwa();
    if (installed) {
      handleClose();
    }
  };

  const renderAppIcon = (size: number = 38) => {
    if (typeof appIcon === 'string') {
      return (
        <img
          src={appIcon}
          alt={appName}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: `${Math.round(size * 0.28)}px`,
            objectFit: 'contain',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.06)',
            flexShrink: 0,
          }}
        />
      );
    }
    if (React.isValidElement(appIcon)) {
      return appIcon;
    }
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${Math.round(size * 0.28)}px`,
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 6px 16px rgba(37, 99, 235, 0.3)',
          flexShrink: 0,
        }}
      >
        <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      </div>
    );
  };

  // 1. Desktop Top Banner Variant
  if (desktopInstallVariant === 'top-banner') {
    return (
      <div
        role="region"
        aria-label={`Install ${appName}`}
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 99990,
          backgroundColor: '#eff6ff',
          borderBottom: '1px solid #bfdbfe',
          padding: '0.5rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: '"Outfit", "Inter", system-ui, -apple-system, sans-serif',
          animation: 'slideDown 0.25s ease-out',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {renderAppIcon(28)}
          <span style={{ fontSize: '0.85rem', color: '#1e3a8a', fontWeight: 600 }}>
            Install <strong>{appName}</strong> on desktop for dedicated window experience & fast loading.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleInstallPwaClick}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
            }}
          >
            Install Desktop App
          </button>
          {hasNativeApk && (
            <button
              onClick={handleDownloadApkClick}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                fontWeight: 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              {downloadingApk ? 'Downloading...' : 'Android APK'}
            </button>
          )}
          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // 2. Default Desktop: Floating Top-Right Notification Card (Non-intrusive, elevated)
  return (
    <div
      role="dialog"
      aria-label={`Install ${appName}`}
      style={{
        position: 'fixed',
        top: '16px',
        right: '24px',
        maxWidth: '380px',
        width: 'calc(100vw - 48px)',
        zIndex: 99990,
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 12px 35px -8px rgba(15, 23, 42, 0.18)',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        fontFamily: '"Outfit", "Inter", system-ui, -apple-system, sans-serif',
        animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {renderAppIcon(38)}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                Install {appName}
              </div>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: '4px' }}>
                Desktop
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.25, marginTop: '2px' }}>
              {appSubtitle || 'Run in a standalone window without browser distractions.'}
            </div>
          </div>
        </div>

        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
          }}
          title="Dismiss"
        >
          ✕
        </button>
      </div>

      {instructionText && (
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '0.5rem 0.7rem',
            fontSize: '0.74rem',
            color: '#1e40af',
          }}
        >
          💡 {instructionText}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={handleInstallPwaClick}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.85rem',
            borderRadius: '10px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span>Install App</span>
        </button>

        {hasNativeApk && (
          <button
            type="button"
            onClick={handleDownloadApkClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              color: '#334155',
              border: '1px solid #cbd5e1',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
            title="Download Android APK"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8.125 12 8.125c-1.8533 0-3.5902.2866-5.1368.8247L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/>
            </svg>
            <span>{downloadingApk ? 'Downloading...' : 'APK'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleClose}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '10px',
            backgroundColor: '#f1f5f9',
            color: '#64748b',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          Later
        </button>
      </div>
    </div>
  );
};
