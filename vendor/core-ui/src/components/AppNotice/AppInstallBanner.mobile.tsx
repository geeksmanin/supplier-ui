import React, { useState } from 'react';
import { AppInstallBannerProps } from './types';
import { useAppInstallPrompt } from './useAppInstallPrompt';

export const AppInstallBannerMobile: React.FC<AppInstallBannerProps> = ({
  appName = 'App',
  appSubtitle,
  appIcon,
  hasNativeApk = false,
  apkDownloadUrl = '/downloads/app.apk',
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
    clearInstructions,
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

  const renderAppIcon = (size: number = 42) => {
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
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      </div>
    );
  };

  return (
    <div
      role="dialog"
      aria-label={`Install ${appName}`}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99998,
        backgroundColor: '#ffffff',
        borderTopLeftRadius: '22px',
        borderTopRightRadius: '22px',
        borderTop: '1px solid #e2e8f0',
        boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.16)',
        padding: '0.85rem 1.15rem max(1rem, env(safe-area-inset-bottom))',
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

      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {renderAppIcon(42)}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Install {appName}
            </h4>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#2563eb', padding: '1px 6px', borderRadius: '6px' }}>
              Mobile
            </span>
          </div>
          <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#64748b', lineHeight: 1.3 }}>
            {appSubtitle || (hasNativeApk ? 'Download official Android app or add to Home Screen' : 'Install as Web App for faster access and push alerts')}
          </p>
        </div>

        <button
          onClick={handleClose}
          aria-label="Dismiss banner"
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
      </div>

      {/* Instructional Tip (e.g. for iOS Safari) */}
      {instructionText && (
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '10px',
            padding: '0.55rem 0.75rem',
            fontSize: '0.76rem',
            color: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <span>💡 {instructionText}</span>
          <button
            onClick={clearInstructions}
            style={{ background: 'none', border: 'none', color: '#1e40af', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}
          >
            OK
          </button>
        </div>
      )}

      {/* Action Buttons Row */}
      <div style={{ display: 'flex', gap: '0.55rem', marginTop: '0.1rem' }}>
        {hasNativeApk ? (
          <>
            {/* Option 1: Native Android APK */}
            <button
              type="button"
              onClick={handleDownloadApkClick}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '12px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                transition: 'transform 0.1s ease',
              }}
            >
              {/* Android robot icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8.125 12 8.125c-1.8533 0-3.5902.2866-5.1368.8247L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/>
              </svg>
              <span>{downloadingApk ? 'Starting...' : 'Android APK'}</span>
            </button>

            {/* Option 2: Lite Web App (PWA) */}
            <button
              type="button"
              onClick={handleInstallPwaClick}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                border: '1.5px solid #cbd5e1',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'background 0.1s ease',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Web App (PWA)</span>
            </button>
          </>
        ) : (
          /* Single Web App Install Button */
          <button
            type="button"
            onClick={handleInstallPwaClick}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Add to Home Screen / Install</span>
          </button>
        )}
      </div>
    </div>
  );
};
