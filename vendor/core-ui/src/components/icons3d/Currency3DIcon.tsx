import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Currency3DIcon: React.FC<Icon3DProps> = ({
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
        <linearGradient id="currCoinTop" x1="40" y1="20" x2="100" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="60%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <linearGradient id="currCoinLeft" x1="20" y1="50" x2="70" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>

        <linearGradient id="currCoinRight" x1="70" y1="50" x2="120" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#065F46" />
        </linearGradient>

        <radialGradient id="currGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#064E3B" stopOpacity="0" />
        </radialGradient>

        <filter id="currShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#064E3B" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Ground Glow */}
      <ellipse cx="70" cy="132" rx="40" ry="12" fill="url(#currGlow)" />

      {/* 3D Coin Stack Base */}
      <g filter="url(#currShadow)">
        {/* Bottom Coin Thickness */}
        <path d="M26 70 L70 94 L70 120 L26 96 Z" fill="url(#currCoinLeft)" />
        <path d="M70 94 L114 70 L114 96 L70 120 Z" fill="url(#currCoinRight)" />
        <ellipse cx="70" cy="70" rx="44" ry="24" fill="url(#currCoinTop)" />
      </g>

      {/* Top Specular Rim */}
      <ellipse cx="70" cy="68" rx="38" ry="20" fill="#ECFDF5" opacity="0.35" />

      {/* Currency Symbol ₹ / $ Gold Seal */}
      <circle cx="70" cy="70" r="15" fill="#FDE047" opacity="0.9" />
      <text
        x="70"
        y="76"
        textAnchor="middle"
        fontSize="18"
        fontWeight="900"
        fill="#854D0E"
        fontFamily="sans-serif"
      >
        ₹
      </text>
    </svg>
  );
};
