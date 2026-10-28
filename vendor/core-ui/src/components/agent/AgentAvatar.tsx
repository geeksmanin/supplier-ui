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
  bg = '#FFFFFF',
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
    // 4. Default Agent Glyph: 3D-styled isometric inventory cube with lighting & depth
    return (
      <svg
        width={Math.round(size * 0.58)}
        height={Math.round(size * 0.58)}
        viewBox="0 0 24 24"
        fill="none"
      >
        <defs>
          <linearGradient id="cubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="cubeLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>
          <linearGradient id="cubeRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0369A1" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>
        </defs>
        {/* Top facet (illuminated sky blue) */}
        <path
          d="M12 2.5 L20.5 7.4 L12 12.3 L3.5 7.4 Z"
          fill="url(#cubeTop)"
          stroke="#0284C7"
          strokeWidth="0.75"
        />
        {/* Left facet (medium ocean blue) */}
        <path
          d="M3.5 7.4 L12 12.3 L12 21.5 L3.5 16.6 Z"
          fill="url(#cubeLeft)"
          stroke="#0369A1"
          strokeWidth="0.75"
        />
        {/* Right facet (deep navy blue) */}
        <path
          d="M12 12.3 L20.5 7.4 L20.5 16.6 L12 21.5 Z"
          fill="url(#cubeRight)"
          stroke="#075985"
          strokeWidth="0.75"
        />
        {/* Package seal / tape highlight */}
        <path
          d="M7.75 4.95 L16.25 9.85"
          stroke="rgba(255, 255, 255, 0.7)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
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
      {/* Crisp Solid White Card with Apple HIG Squircle */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: Math.round(size * 0.28), // Continuous Apple squircle ratio
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Soft subtle tint overlay if custom bg is specified */}
        {bg && bg !== 'transparent' && bg !== '#FFFFFF' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: bg,
              opacity: 0.15,
              pointerEvents: 'none',
            }}
          />
        )}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {renderIcon()}
        </div>
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
            boxShadow: '0 1px 3px rgba(0,0,0,0.22)',
            zIndex: 2,
          }}
        >
          <VerifiedBlueTick size={tickSize} />
        </div>
      )}
    </div>
  );
};
