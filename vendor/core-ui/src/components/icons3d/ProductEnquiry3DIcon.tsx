import React from 'react';
import { Category3DIconProps } from './TicketCategoryIcons.types';

/**
 * 4. 3D Product & Inquiry Icon (❓)
 * Sapphire volumetric discovery globe & inquiry orb with sparkling question mark.
 */
export const ProductEnquiry3DIcon: React.FC<Category3DIconProps> = ({
  size = 20,
  style,
  className,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <defs>
        <radialGradient id="enqDrop" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="enqOrb" x1="16" y1="12" x2="48" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="40%" stopColor="#2563EB" />
          <stop offset="85%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id="enqRim" x1="32" y1="12" x2="32" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
        <filter id="enqGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1E3A8A" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="32" cy="57" rx="20" ry="4.5" fill="url(#enqDrop)" />

      {/* 3D Volumetric Squircle Orb */}
      <rect x="12" y="16" width="40" height="40" rx="14" fill="#172554" />
      <rect x="12" y="13" width="40" height="40" rx="14" fill="url(#enqOrb)" stroke="url(#enqRim)" strokeWidth="1.2" filter="url(#enqGlow)" />

      {/* Glass Top Flare */}
      <path
        d="M 18 17 C 26 15, 38 15, 46 17 C 48 20, 44 26, 36 28 C 24 30, 18 24, 18 17 Z"
        fill="#FFFFFF"
        opacity="0.4"
      />

      {/* Luminous High-Definition Question Mark Glyphs */}
      <g filter="url(#enqGlow)">
        <path
          d="M 27 24 C 27 21, 37 21, 37 25 C 37 28.5, 32 30, 32 34"
          stroke="#FFFFFF"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="32" cy="41" r="2.2" fill="#FFFFFF" />
      </g>

      {/* Top Right Mini Sparkle Star */}
      <path
        d="M 44 14 Q 45 18 49 19 Q 45 20 44 24 Q 43 20 39 19 Q 43 18 44 14 Z"
        fill="#FEF08A"
      />
    </svg>
  );
};
