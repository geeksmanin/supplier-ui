import React from 'react';
import { VerifiedBlueTick } from './VerifiedBlueTick';

export interface AgentAvatarProps {
  size?: number;
  icon?: React.ReactNode;
  bg?: string;
  isVerified?: boolean;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  size = 42,
  icon,
  bg = 'rgba(0, 122, 255, 0.12)',
  isVerified = true,
}) => {
  const tickSize = Math.max(12, Math.round(size * 0.38));

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
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
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
          fontSize: typeof icon === 'string' ? Math.round(size * 0.5) : undefined,
        }}
      >
        {icon || (
          <span role="img" aria-label="Agent" style={{ fontSize: Math.round(size * 0.5) }}>
            🤖
          </span>
        )}
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
            boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
          }}
        >
          <VerifiedBlueTick size={tickSize} />
        </div>
      )}
    </div>
  );
};
