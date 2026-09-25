import React, { useState } from 'react';

export interface InstallChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName?: string;
  appSubtitle?: string;
  appIcon?: string;
  apkDownloadUrl?: string;
  deferredPrompt?: any;
  onInstallStarted?: () => void;
}

export const InstallChoiceModal: React.FC<InstallChoiceModalProps> = ({
  isOpen,
  onClose,
  appName = 'Ajit Pharma',
  appSubtitle = 'Install the official application on your Android device',
  appIcon,
  apkDownloadUrl = '/downloads/app.apk',
  deferredPrompt,
  onInstallStarted,
}) => {
  const [downloadStarted, setDownloadStarted] = useState<boolean>(false);
  const [pwaInstalled, setPwaInstalled] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownloadApk = () => {
    setDownloadStarted(true);
    if (onInstallStarted) onInstallStarted();

    // Trigger APK download
    const link = document.createElement('a');
    link.href = apkDownloadUrl;
    link.setAttribute('download', apkDownloadUrl.split('/').pop() || 'app.apk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      onClose();
      setDownloadStarted(false);
    }, 1500);
  };

  const handleInstallPwa = async () => {
    if (onInstallStarted) onInstallStarted();

    if (deferredPrompt && typeof deferredPrompt.prompt === 'function') {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice?.outcome === 'accepted') {
          setPwaInstalled(true);
          setTimeout(() => {
            onClose();
            setPwaInstalled(false);
          }, 1200);
          return;
        }
      } catch (err) {
        console.warn('PWA prompt failed:', err);
      }
    } else {
      // Fallback instruction if deferredPrompt is not available
      alert('To install the Lite App: Tap the 3 dots (⋮) in your Chrome browser menu and select "Install app" or "Add to Home screen".');
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '0',
        fontFamily: '"Outfit", "Inter", system-ui, -apple-system, sans-serif',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.75rem 1.5rem 1.5rem',
          maxHeight: '92vh',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Top Handlebar */}
        <div
          style={{
            width: '40px',
            height: '4px',
            backgroundColor: '#cbd5e1',
            borderRadius: '999px',
            margin: '-0.5rem auto 1.25rem',
          }}
        />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.25rem' }}>
          {appIcon ? (
            <img
              src={appIcon}
              alt={appName}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                objectFit: 'contain',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              }}
            />
          ) : (
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 6px 16px rgba(37, 99, 235, 0.3)',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Install {appName}
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              {appSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '999px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            ✕
          </button>
        </div>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.25rem' }}>
          {/* Option 1: Native Android App (.APK) */}
          <div
            onClick={handleDownloadApk}
            style={{
              position: 'relative',
              padding: '1.1rem',
              borderRadius: '18px',
              border: '2px solid #2563eb',
              background: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              transition: 'transform 0.15s, box-shadow 0.15s',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                >
                  {/* Android Robot Icon */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8.125 12 8.125c-1.8533 0-3.5902.2866-5.1368.8247L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                    Native Android App
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Full features, native performance & background push
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '3px 8px',
                  borderRadius: '999px',
                  letterSpacing: '0.02em',
                }}
              >
                RECOMMENDED
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>
                Direct APK • Auto-Updates included
              </div>
              <button
                type="button"
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.45rem 0.95rem',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                {downloadStarted ? (
                  <span>Starting...</span>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Download APK</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option 2: Lite App (Instant Web App / PWA) */}
          <div
            onClick={handleInstallPwa}
            style={{
              padding: '1.1rem',
              borderRadius: '18px',
              border: '1.5px solid #e2e8f0',
              background: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0f172a' }}>
                    Instant Lite App
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Zero download • Adds directly to Home Screen
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: '#e2e8f0',
                  color: '#475569',
                  padding: '3px 8px',
                  borderRadius: '999px',
                }}
              >
                PWA LITE
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Low storage • Runs via Chrome
              </div>
              <button
                type="button"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '0.45rem 0.95rem',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                {pwaInstalled ? (
                  <span>Installed!</span>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Add to Home Screen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            Continue in browser
          </button>
        </div>
      </div>
    </div>
  );
};
