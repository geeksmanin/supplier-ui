import React, { useEffect, useRef, useState } from 'react';
import { useAppUpdater, UseAppUpdaterOptions } from './useAppUpdater';

export interface AppUpdateBannerProps extends UseAppUpdaterOptions {
  appName?: string;
  /** Pixels from the bottom of the viewport. Default: 16. Set ~72 to clear a mobile bottom nav bar. */
  bottomOffset?: number;
  updater?: ReturnType<typeof useAppUpdater>;
}

/**
 * AppUpdateBanner
 *
 * A self-contained, bottom-anchored update notification strip for non-mandatory
 * app updates.  Drop it anywhere in the React tree — it renders nothing until an
 * update is available, then slides up from the bottom of the screen.
 *
 * For mandatory (force_update) updates the parent AppUpdateModal still shows the
 * blocking full-screen modal; this component only handles the "soft" nudge.
 */
export const AppUpdateBanner: React.FC<AppUpdateBannerProps> = ({
  appName = 'App',
  bottomOffset = 16,
  updater: externalUpdater,
  ...options
}) => {
  const internalUpdater = useAppUpdater(options);
  const updater = externalUpdater ?? internalUpdater;

  const {
    updateAvailable,
    isMandatory,
    latestVersion,
    isDownloading,
    downloadProgress,
    error,
    downloadAndInstall,
    dismissUpdate,
  } = updater;

  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Animate in / out cleanly
  useEffect(() => {
    // Clear any lingering timers to avoid double-fire
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    const show = updateAvailable && !isMandatory;

    if (show) {
      setMounted(true);
      const t = setTimeout(() => setVisible(true), 20);
      timersRef.current.push(t);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 320);
      timersRef.current.push(t);
    }

    return () => timersRef.current.forEach(clearTimeout);
  }, [updateAvailable, isMandatory]);

  if (!mounted) return null;

  return (
    <>
      {/* Inject keyframe once */}
      <style>{`
        @keyframes __aub_slideup {
          from { transform: translateY(110%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes __aub_slidedown {
          from { transform: translateY(0);    opacity: 1; }
          to   { transform: translateY(110%); opacity: 0; }
        }
      `}</style>

      <div
        id="app-update-banner"
        role="alert"
        aria-live="polite"
        style={{
          position: 'fixed',
          left: '50%',
          transform: visible
            ? 'translateX(-50%) translateY(0)'
            : 'translateX(-50%) translateY(110%)',
          bottom: `${bottomOffset}px`,
          width: 'calc(100% - 32px)',
          maxWidth: '460px',
          backgroundColor: '#0f172a',
          borderRadius: '18px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -6px 32px -4px rgba(0,0,0,0.45), 0 0 0 1px rgba(37,99,235,0.25)',
          zIndex: 99999,
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: '"Outfit", "Inter", system-ui, -apple-system, sans-serif',
          overflow: 'hidden',
          transition: visible
            ? 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease'
            : 'transform 0.28s cubic-bezier(0.4, 0, 1, 1), opacity 0.28s ease',
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Gradient accent line */}
        <div
          style={{
            height: '3px',
            background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 50%, #06b6d4 100%)',
            flexShrink: 0,
          }}
        />

        <div style={{ padding: '0.75rem 1rem' }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* Rocket icon */}
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '11px',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.35 22.35 0 0 1-3.95 2z" />
              </svg>
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  color: '#f1f5f9',
                  letterSpacing: '-0.01em',
                }}
              >
                {appName} v{latestVersion} is ready
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '1px' }}>
                Tap "Update" to download &amp; install the latest version
              </div>
            </div>

            {/* Dismiss ✕ */}
            <button
              id="app-update-banner-dismiss"
              onClick={dismissUpdate}
              aria-label="Dismiss update"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '5px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                marginTop: '0.6rem',
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                padding: '0.45rem 0.7rem',
                fontSize: '0.75rem',
                color: '#fca5a5',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Progress bar (visible during download) */}
          {isDownloading ? (
            <div style={{ marginTop: '0.65rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#94a3b8',
                  marginBottom: '0.3rem',
                }}
              >
                <span>Downloading update…</span>
                <span>{downloadProgress}%</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '5px',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${downloadProgress}%`,
                    background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
                    borderRadius: '999px',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>
              <div
                style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.3rem' }}
              >
                The installer will launch automatically once complete.
              </div>
            </div>
          ) : (
            /* Action buttons row */
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                marginTop: '0.65rem',
              }}
            >
              <button
                id="app-update-banner-update"
                onClick={downloadAndInstall}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.85rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
                  transition: 'transform 0.12s, box-shadow 0.12s',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Update Now
              </button>

              <button
                id="app-update-banner-later"
                onClick={dismissUpdate}
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                Later
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
