import React, { useState } from 'react';
import { useAppVersion } from '../../hooks/useAppVersion';
import { DevServerModal } from '../DevServerModal';

export interface LoginVersionFooterProps {
  appName?: string;
  theme?: 'green' | 'blue' | 'light' | 'dark';
  versionUrl?: string;
  defaultProductionUrl?: string;
  defaultStagingUrl?: string;
  style?: React.CSSProperties;
}

export const LoginVersionFooter: React.FC<LoginVersionFooterProps> = ({
  appName = 'App',
  theme = 'light',
  versionUrl = '/downloads/version.json',
  defaultProductionUrl,
  defaultStagingUrl,
  style,
}) => {
  const {
    webVersion,
    androidVersion,
    androidBuild,
    desktopVersion,
    isNativeAndroid,
    isDesktop,
  } = useAppVersion(versionUrl);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);

  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const hintTimeoutRef = React.useRef<any>(null);

  const handleVersionTap = () => {
    const now = Date.now();
    const isQuick = now - lastTapTime < 2500;
    const nextCount = isQuick ? tapCount + 1 : 1;

    setTapCount(nextCount);
    setLastTapTime(now);

    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
    }

    if (nextCount >= 5) {
      setTapCount(0);
      setHint(null);
      setIsDevModalOpen(true);
    } else if (nextCount >= 3) {
      setHint(`${5 - nextCount} tap${5 - nextCount === 1 ? '' : 's'} away from Developer Tools`);
      hintTimeoutRef.current = setTimeout(() => {
        setHint(null);
      }, 2000);
    }
  };

  // Color schemes based on theme
  const isGreen = theme === 'green';
  const isDark = theme === 'dark';

  const badgeBg = isGreen
    ? 'rgba(255, 255, 255, 0.14)'
    : isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : '#f8fafc';

  const badgeBorder = isGreen
    ? 'rgba(255, 255, 255, 0.24)'
    : isDark
    ? 'rgba(255, 255, 255, 0.15)'
    : '#e2e8f0';

  const textColor = isGreen || isDark ? '#ffffff' : '#334155';
  const activeDotColor = isGreen ? '#4ade80' : '#22c55e';

  // Format version strings
  const formattedAndroid = androidVersion
    ? `v${androidVersion.replace(/^v/, '')}${androidBuild ? ` (${androidBuild})` : ''}`
    : '';

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '12px',
          fontFamily: '"Outfit", "Inter", -apple-system, sans-serif',
          ...style,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '11px',
          }}
        >
          {/* Desktop Version Pill (if running in desktop shell) */}
          {(isDesktop || desktopVersion) && (
            <div
              onClick={handleVersionTap}
              id="login-version-desktop-pill"
              data-testid="login-version-desktop-pill"
              title="Desktop App Version (Tap 5 times for Developer Tools)"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '999px',
                backgroundColor: badgeBg,
                border: `1px solid ${badgeBorder}`,
                color: textColor,
                fontWeight: 600,
                backdropFilter: 'blur(4px)',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'transform 0.1s ease, background-color 0.15s ease',
              }}
            >
              <span style={{ fontSize: '11px' }}>🖥️</span>
              <span>Desktop {desktopVersion || 'Shell'}</span>
              {isDesktop && (
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: activeDotColor,
                    boxShadow: `0 0 5px ${activeDotColor}`,
                  }}
                  title="Active Desktop Runtime"
                />
              )}
            </div>
          )}

          {/* Web Version Pill - Tap to unlock dev options */}
          <div
            onClick={handleVersionTap}
            id="login-version-web-pill"
            data-testid="login-version-web-pill"
            title="Web Client Version (Tap 5 times for Developer Tools)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: badgeBg,
              border: `1px solid ${badgeBorder}`,
              color: textColor,
              fontWeight: 600,
              backdropFilter: 'blur(4px)',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'transform 0.1s ease, background-color 0.15s ease',
            }}
          >
            <span style={{ fontSize: '11px' }}>🌐</span>
            <span>Web {webVersion}</span>
            {!isNativeAndroid && !isDesktop && (
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: activeDotColor,
                  boxShadow: `0 0 5px ${activeDotColor}`,
                }}
                title="Active Web Runtime"
              />
            )}
          </div>

          {/* Android Version Pill - Tap to unlock dev options */}
          {formattedAndroid && (
            <div
              onClick={handleVersionTap}
              id="login-version-android-pill"
              data-testid="login-version-android-pill"
              title={isNativeAndroid ? "Active Native Android App (Tap 5 times for Developer Tools)" : "Available Android APK Version"}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '999px',
                backgroundColor: badgeBg,
                border: `1px solid ${badgeBorder}`,
                color: textColor,
                fontWeight: 600,
                backdropFilter: 'blur(4px)',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'transform 0.1s ease, background-color 0.15s ease',
              }}
            >
              <span style={{ fontSize: '11px' }}>📱</span>
              <span>Android {formattedAndroid}</span>
              {isNativeAndroid && (
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: activeDotColor,
                    boxShadow: `0 0 5px ${activeDotColor}`,
                  }}
                  title="Active Native Android Shell"
                />
              )}
            </div>
          )}
        </div>

        {/* Step-by-step developer mode unlock feedback */}
        {hint && (
          <div
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: isGreen || isDark ? 'rgba(255, 255, 255, 0.9)' : '#475569',
              backgroundColor: isGreen || isDark ? 'rgba(0, 0, 0, 0.3)' : '#f1f5f9',
              border: isGreen || isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #cbd5e1',
              borderRadius: '999px',
              padding: '2px 8px',
              marginTop: '5px',
              textAlign: 'center',
            }}
          >
            {hint}
          </div>
        )}
      </div>

      <DevServerModal
        isOpen={isDevModalOpen}
        onClose={() => setIsDevModalOpen(false)}
        appName={appName}
        defaultProductionUrl={defaultProductionUrl}
        defaultStagingUrl={defaultStagingUrl}
      />
    </>
  );
};
