import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Brand3DIcon: React.FC<Icon3DProps> = ({
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
        <linearGradient id="brandTopGrad" x1="40" y1="20" x2="100" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        <linearGradient id="brandLeftGrad" x1="20" y1="50" x2="70" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        <linearGradient id="brandRightGrad" x1="70" y1="50" x2="120" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        <linearGradient id="brandStarGrad" x1="60" y1="15" x2="80" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FEF3C7" />
        </linearGradient>

        <radialGradient id="brandBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#78350F" stopOpacity="0" />
        </radialGradient>

        <filter id="brandShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#78350F" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Ground Glow */}
      <ellipse cx="70" cy="132" rx="40" ry="12" fill="url(#brandBaseGlow)" />

      {/* 3D Shield / Diamond Base */}
      <g filter="url(#brandShadow)">
        {/* Left Side */}
        <path d="M26 50 L70 75 L70 125 L26 100 Z" fill="url(#brandLeftGrad)" />
        {/* Right Side */}
        <path d="M70 75 L114 50 L114 100 L70 125 Z" fill="url(#brandRightGrad)" />
        {/* Top Face */}
        <path d="M70 20 L114 50 L70 75 L26 50 Z" fill="url(#brandTopGrad)" />
      </g>

      {/* Highlight Top Rim */}
      <path d="M70 22 L108 48 L70 70 L32 48 Z" fill="#FFFFFF" opacity="0.35" />

      {/* Floating 3D Star Badge */}
      <g filter="url(#brandShadow)">
        <polygon
          points="70,30 75,44 90,44 78,53 82,67 70,58 58,67 62,53 50,44 65,44"
          fill="url(#brandStarGrad)"
        />
        <polygon
          points="70,33 73,43 83,43 75,49 78,59 70,53 62,59 65,49 57,43 67,43"
          fill="#FFFBEB"
        />
      </g>
    </svg>
  );
};
