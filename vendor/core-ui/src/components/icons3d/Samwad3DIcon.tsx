import React from 'react';

export interface Samwad3DIconProps {
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const Samwad3DIcon: React.FC<Samwad3DIconProps> = ({
  size = 48,
  className,
  style,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <defs>
        {/* Authentic 3D Blue to Green Background */}
        <linearGradient id="samwadBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="50%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#008069" />
        </linearGradient>
        {/* Main Upper Bubble: Vibrant 3D Blue */}
        <linearGradient id="samwadBubbleMainGrad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="40%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        {/* Accent Overlapping Bubble: Vibrant Emerald Green */}
        <linearGradient id="samwadBubbleAccentGrad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="45%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <filter id="samwadIconShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0F172A" floodOpacity="0.32" />
        </filter>
      </defs>
      <rect width="464" height="464" x="24" y="24" rx="112" fill="url(#samwadBgGrad)" />
      <g filter="url(#samwadIconShadow)">
        {/* Main Blue Bubble */}
        <path
          d="M140 136 C220 136 348 136 348 136 C387 136 418 167 418 206 C418 245 387 276 348 276 L254 276 L194 330 L204 276 L140 276 C101 276 70 245 70 206 C70 167 101 136 140 136 Z"
          fill="url(#samwadBubbleMainGrad)"
        />
        <circle cx="170" cy="206" r="16" fill="#FFFFFF" />
        <circle cx="225" cy="206" r="16" fill="#FFFFFF" />
        <circle cx="280" cy="206" r="16" fill="#FFFFFF" />

        {/* Accent Green Bubble */}
        <path
          d="M256 220 C322 220 376 220 376 220 C410 220 436 246 436 280 C436 314 410 340 376 340 L346 340 L320 380 L314 340 L256 340 C222 340 196 314 196 280 C196 246 222 220 256 220 Z"
          fill="url(#samwadBubbleAccentGrad)"
        />
        <circle cx="285" cy="280" r="12" fill="#0C4A6E" />
        <circle cx="335" cy="280" r="12" fill="#0C4A6E" />
      </g>
    </svg>
  );
};
