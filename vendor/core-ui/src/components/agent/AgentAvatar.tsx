import React from 'react';
import { VerifiedBlueTick } from './VerifiedBlueTick';

export interface AgentAvatarProps {
  size?: number;
  icon?: React.ReactNode;
  bg?: string;
  isVerified?: boolean;
  style?: React.CSSProperties;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  size = 42,
  icon,
  bg = 'rgba(0, 122, 255, 0.12)',
  isVerified = true,
  style,
}) => {
  const tickSize = Math.max(12, Math.round(size * 0.38));

  const renderIcon = () => {
    // 1. High-definition vector glyph for Support / Triage Agent
    if (icon === '🛠️' || icon === 'tools' || icon === 'support') {
      return (
        <svg
          width={Math.round(size * 0.54)}
          height={Math.round(size * 0.54)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2563EB"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    }
    // 2. Properly scaled emoji strings
    if (typeof icon === 'string') {
      return (
        <span
          style={{
            fontSize: Math.round(size * 0.52),
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
          }}
        >
          {icon}
        </span>
      );
    }
    // 3. Custom ReactNode icon
    if (icon) {
      return icon;
    }
    // 4. Default Agent Glyph: 3D-styled inventory cube
    return (
      <svg
        width={Math.round(size * 0.54)}
        height={Math.round(size * 0.54)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#007AFF"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    );
  };

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Translucent Apple HIG Squircle */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: Math.round(size * 0.28), // Continuous Apple squircle ratio
          backgroundColor: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(0, 122, 255, 0.25)',
          boxShadow: '0 2px 8px rgba(0, 122, 255, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
          overflow: 'hidden',
        }}
      >
        {renderIcon()}
      </div>

      {/* Official Verified Blue Tick Badge Overlay */}
      {isVerified && (
        <div
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
            zIndex: 2,
          }}
        >
          <VerifiedBlueTick size={tickSize} />
        </div>
      )}
    </div>
  );
};
