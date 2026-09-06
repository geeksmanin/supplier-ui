import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const HR3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Top Boss Card Gradient */}
        <linearGradient id="hrTopCard" x1="45" y1="15" x2="95" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>

        {/* Bottom Left Card */}
        <linearGradient id="hrBottomLeft" x1="20" y1="75" x2="65" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A5B4FC" />
          <stop offset="50%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>

        {/* Bottom Right Card */}
        <linearGradient id="hrBottomRight" x1="75" y1="75" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A5B4FC" />
          <stop offset="50%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>

        {/* Depth Shadow */}
        <linearGradient id="hrDepth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4338CA" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>

        {/* Specular Flare */}
        <linearGradient id="hrHighlight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Base Glow */}
        <radialGradient id="hrBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#4F46E5" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
        </radialGradient>

        {/* Soft Drop Shadow */}
        <filter id="hrShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#1E1B4B" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Ground Soft Glow */}
      <ellipse cx="70" cy="132" rx="42" ry="12" fill="url(#hrBaseGlow)" />
      <ellipse cx="70" cy="130" rx="30" ry="8" fill="#6366F1" opacity="0.25" />

      {/* Connecting Hierarchy Tree 3D Pipes */}
      <path
        d="M70 54 L70 72 M42 72 L98 72 M42 72 L42 80 M98 72 L98 80"
        stroke="#C7D2FE"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 3D Cards Group */}
      <g filter="url(#hrShadow)">
        {/* Top Master Card (Leader/HR Head) */}
        <rect x="48" y="20" width="44" height="38" rx="10" fill="url(#hrDepth)" transform="translate(0, 3)" />
        <rect x="48" y="18" width="44" height="38" rx="10" fill="url(#hrTopCard)" />
        <rect x="50" y="20" width="40" height="16" rx="7" fill="url(#hrHighlight)" />
        {/* Avatar Head/Torso Top */}
        <circle cx="70" cy="30" r="6.5" fill="#FFFFFF" />
        <path d="M60 48 C60 40 64 38 70 38 C76 38 80 40 80 48" fill="#FFFFFF" />

        {/* Bottom Left Card */}
        <rect x="20" y="82" width="44" height="38" rx="10" fill="url(#hrDepth)" transform="translate(0, 3)" />
        <rect x="20" y="80" width="44" height="38" rx="10" fill="url(#hrBottomLeft)" />
        <rect x="22" y="82" width="40" height="16" rx="7" fill="url(#hrHighlight)" />
        {/* Avatar Left */}
        <circle cx="42" cy="92" r="6" fill="#FFFFFF" />
        <path d="M33 110 C33 103 36 101 42 101 C48 101 51 103 51 110" fill="#FFFFFF" />

        {/* Bottom Right Card */}
        <rect x="76" y="82" width="44" height="38" rx="10" fill="url(#hrDepth)" transform="translate(0, 3)" />
        <rect x="76" y="80" width="44" height="38" rx="10" fill="url(#hrBottomRight)" />
        <rect x="78" y="82" width="40" height="16" rx="7" fill="url(#hrHighlight)" />
        {/* Avatar Right */}
        <circle cx="98" cy="92" r="6" fill="#FFFFFF" />
        <path d="M89 110 C89 103 92 101 98 101 C104 101 107 103 107 110" fill="#FFFFFF" />
      </g>
    </svg>
  );
};
