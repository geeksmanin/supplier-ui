import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Branch3DIcon: React.FC<Icon3DProps> = ({
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
        <linearGradient id="branchMainGrad" x1="30" y1="20" x2="110" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        <linearGradient id="branchSubGrad" x1="15" y1="60" x2="65" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <linearGradient id="branchHighlight" x1="40" y1="20" x2="70" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        <radialGradient id="branchBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
          <stop offset="80%" stopColor="#047857" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#064E3B" stopOpacity="0" />
        </radialGradient>

        <filter id="branchShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#064E3B" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Base Radial Glow */}
      <ellipse cx="70" cy="132" rx="42" ry="12" fill="url(#branchBaseGlow)" />

      {/* Connecting Tree Network Lines */}
      <path d="M70 75 L35 105" stroke="#34D399" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
      <path d="M70 75 L105 105" stroke="#34D399" strokeWidth="4" strokeLinecap="round" opacity="0.85" />

      {/* Left Sub-Branch Node */}
      <circle cx="35" cy="105" r="14" fill="url(#branchSubGrad)" filter="url(#branchShadow)" />
      <path d="M28 105 H42 M35 98 V112" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

      {/* Right Sub-Branch Node */}
      <circle cx="105" cy="105" r="14" fill="url(#branchSubGrad)" filter="url(#branchShadow)" />
      <path d="M98 105 H112 M105 98 V112" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

      {/* Main Headquarters Tower (Center) */}
      <rect x="52" y="24" width="36" height="68" rx="6" fill="url(#branchMainGrad)" filter="url(#branchShadow)" />
      
      {/* Gloss Highlight */}
      <path d="M52 30 C52 26 56 24 60 24 H76 C60 32 54 48 52 64 Z" fill="url(#branchHighlight)" />

      {/* Building Windows */}
      <rect x="60" y="34" width="7" height="9" rx="1.5" fill="#FFFFFF" opacity="0.9" />
      <rect x="73" y="34" width="7" height="9" rx="1.5" fill="#FFFFFF" opacity="0.9" />
      <rect x="60" y="49" width="7" height="9" rx="1.5" fill="#FFFFFF" opacity="0.9" />
      <rect x="73" y="49" width="7" height="9" rx="1.5" fill="#FFFFFF" opacity="0.9" />
      <rect x="60" y="64" width="7" height="9" rx="1.5" fill="#FFFFFF" opacity="0.9" />
      <rect x="73" y="64" width="7" height="9" rx="1.5" fill="#FFFFFF" opacity="0.9" />

      {/* Crown / Star Emblem on Head Office */}
      <path d="M70 12 L73 18 L79 19 L74 23 L76 29 L70 26 L64 29 L66 23 L61 19 L67 18 Z" fill="#F59E0B" />
    </svg>
  );
};
