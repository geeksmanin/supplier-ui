import React, { useState } from 'react';
import { SystemVersionInfo } from '../../hooks/useSystemVersion';
import { SystemVersionModal } from './SystemVersionModal';

export interface SystemVersionBadgeProps {
  versionInfo: SystemVersionInfo;
  appName?: string;
  className?: string;
  style?: React.CSSProperties;
  enableDevModeTrigger?: boolean;
}

export const SystemVersionBadge: React.FC<SystemVersionBadgeProps> = ({
  versionInfo,
  appName = 'Geeksman OS',
  className = '',
  style,
}) => {
  const {
    webAppVersion,
    androidAppVersion,
    androidBuild,
    desktopAppVersion,
    activePlatform,
    updateReady,
    modalOpen,
    setModalOpen,
  } = versionInfo;

  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);

  const displayVersion = activePlatform === 'android' && androidAppVersion
    ? `Android ${androidAppVersion}${androidBuild ? ` (${androidBuild})` : ''}`
    : activePlatform === 'desktop' && desktopAppVersion
    ? `Desktop ${desktopAppVersion}`
    : `Web ${webAppVersion}`;

  const platformIcon = activePlatform === 'android'
    ? '📱'
    : activePlatform === 'desktop'
    ? '🖥️'
    : '🌐';

  const handleClick = () => {
    const now = Date.now();
    const isQuick = now - lastTapTime < 2500;
    const nextCount = isQuick ? tapCount + 1 : 1;
    setTapCount(nextCount);
    setLastTapTime(now);

    setModalOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`system-version-badge-pill ${className}`}
        title="View full system & runtime version specifications"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.25rem 0.65rem',
          borderRadius: '999px',
          backgroundColor: updateReady ? '#fef2f2' : '#f8fafc',
          border: updateReady ? '1px solid #fecaca' : '1px solid #e2e8f0',
          color: updateReady ? '#b91c1c' : '#334155',
          fontSize: '0.725rem',
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: '"Outfit", "Inter", -apple-system, sans-serif',
          transition: 'all 0.15s ease',
          outline: 'none',
          ...style,
        }}
      >
        <span>{platformIcon}</span>
        <span>{displayVersion}</span>
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: updateReady ? '#ef4444' : '#22c55e',
            boxShadow: updateReady ? '0 0 6px #ef4444' : '0 0 5px #22c55e',
          }}
        />
      </button>

      <SystemVersionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        versionInfo={versionInfo}
        appName={appName}
      />
    </>
  );
};
