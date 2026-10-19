import React, { useState } from 'react';
import { usePlatformVersions } from '../../hooks/usePlatformVersions';
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
  const { webVersion, androidVersion, androidBuild, isNative } = usePlatformVersions(versionUrl);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);

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
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginTop: '12px',
          fontSize: '11px',
          fontFamily: '"Outfit", "Inter", -apple-system, sans-serif',
          ...style,
        }}
      >
        {/* Web Version Pill */}
        <div
          title="Web Client Version"
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
          }}
        >
          <span style={{ fontSize: '11px' }}>🌐</span>
          <span>Web {webVersion}</span>
          {!isNative && (
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

        {/* Android Version Pill */}
        {formattedAndroid && (
          <div
            title={isNative ? "Active Native Android App" : "Available Android APK Version"}
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
            }}
          >
            <span style={{ fontSize: '11px' }}>📱</span>
            <span>Android {formattedAndroid}</span>
            {isNative && (
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

        {/* Developer Server Tools Trigger Button */}
        <button
          type="button"
          onClick={() => setIsDevModalOpen(true)}
          id="login-dev-server-btn"
          data-testid="login-dev-tools-btn"
          title="Open Developer Tools (Environment Switcher, Mobile DevTools Console, Diagnostics)"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: '999px',
            backgroundColor: isGreen ? 'rgba(255, 255, 255, 0.22)' : isDark ? 'rgba(37, 99, 235, 0.2)' : '#eff6ff',
            border: isGreen ? '1px solid rgba(255, 255, 255, 0.4)' : isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid #bfdbfe',
            color: isGreen ? '#ffffff' : isDark ? '#60a5fa' : '#2563eb',
            fontWeight: 700,
            cursor: 'pointer',
            outline: 'none',
            fontSize: '11px',
            transition: 'all 0.15s ease',
          }}
        >
          <span>🛠️</span>
          <span>Dev Tools</span>
        </button>
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
