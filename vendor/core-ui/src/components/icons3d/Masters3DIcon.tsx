import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Masters3DIcon: React.FC<Icon3DProps> = ({
  width = '100%',
  height = '100%',
  size,
  style
}) => {
  const w = size ?? width;
  const h = size ?? height;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 140 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', maxWidth: '100%', maxHeight: '100%', ...style }}
    >
      <defs>
        <linearGradient id="mTopGrad" x1="40" y1="20" x2="100" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="60%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>

        <linearGradient id="mLeftGrad" x1="20" y1="50" x2="70" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4338CA" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>

        <linearGradient id="mRightGrad" x1="70" y1="50" x2="120" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#3730A3" />
        </linearGradient>

        <linearGradient id="mHighlight" x1="50" y1="25" x2="90" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="mBadgeGrad" x1="50" y1="10" x2="90" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>

        <radialGradient id="mBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#312E81" stopOpacity="0" />
        </radialGradient>

        <filter id="mShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#312E81" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Ground Glow */}
      <ellipse cx="70" cy="132" rx="42" ry="12" fill="url(#mBaseGlow)" />

      {/* 3D Stack Layer 1 (Bottom) */}
      <g filter="url(#mShadow)">
        <path d="M26 82 L70 106 L114 82 L70 58 Z" fill="#3730A3" opacity="0.6" />
        <path d="M26 82 L70 106 L70 118 L26 94 Z" fill="#312E81" opacity="0.7" />
        <path d="M70 106 L114 82 L114 94 L70 118 Z" fill="#3730A3" opacity="0.7" />
      </g>

      {/* 3D Stack Layer 2 (Middle) */}
      <g filter="url(#mShadow)">
        <path d="M26 62 L70 86 L114 62 L70 38 Z" fill="url(#mRightGrad)" />
        <path d="M26 62 L70 86 L70 96 L26 72 Z" fill="url(#mLeftGrad)" />
        <path d="M70 86 L114 62 L114 72 L70 96 Z" fill="url(#mRightGrad)" />
      </g>

      {/* Top Main Isometric Cube Layer */}
      <g filter="url(#mShadow)">
        <path d="M26 42 L70 66 L70 76 L26 52 Z" fill="url(#mLeftGrad)" />
        <path d="M70 66 L114 42 L114 52 L70 76 Z" fill="url(#mRightGrad)" />
        <path d="M70 18 L114 42 L70 66 L26 42 Z" fill="url(#mTopGrad)" />
      </g>

      {/* Specular Highlight */}
      <path d="M70 19 L106 39 L70 57 L34 37 Z" fill="url(#mHighlight)" opacity="0.8" />

      {/* Floating Gold Crown/Gear Master Chip */}
      <circle cx="70" cy="42" r="12" fill="url(#mBadgeGrad)" />
      <circle cx="70" cy="42" r="7" fill="#FFFFFF" opacity="0.9" />
      <path d="M70 37 L72 40 L76 42 L72 44 L70 47 L68 44 L64 42 L68 40 Z" fill="#CA8A04" />
    </svg>
  );
};
