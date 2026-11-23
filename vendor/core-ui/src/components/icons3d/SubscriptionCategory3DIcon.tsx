import React from 'react';
import { Category3DIconProps } from './TicketCategoryIcons.types';

/**
 * 2. 3D Subscription & License Icon (🔄)
 * Luxury 3D Recurring Infinity Ribbon with Gold Diamond License Seal.
 * Replaces the ugly Unicode reload arrows.
 */
export const SubscriptionCategory3DIcon: React.FC<Category3DIconProps> = ({
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
        <radialGradient id="subDrop" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3B0764" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#3B0764" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="subOrbit1" x1="10" y1="12" x2="54" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="40%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#6B21A8" />
        </linearGradient>
        <linearGradient id="subOrbit2" x1="14" y1="46" x2="52" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
        <linearGradient id="subGoldCore" x1="22" y1="20" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="35%" stopColor="#FACC15" />
          <stop offset="75%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#A16207" />
        </linearGradient>
        <linearGradient id="subGoldFacet" x1="24" y1="22" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FEF08A" />
        </linearGradient>
        <filter id="subGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#3B0764" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="32" cy="57" rx="20" ry="4" fill="url(#subDrop)" />

      {/* Back Orbit Ribbon */}
      <path
        d="M 16 32 C 16 20, 32 14, 46 20 C 53 23, 54 28, 50 34"
        stroke="url(#subOrbit1)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />

      {/* Front Orbit Ribbon with Arrow Head */}
      <path
        d="M 48 32 C 48 44, 32 50, 18 44 C 11 41, 10 36, 14 30"
        stroke="url(#subOrbit2)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Dynamic Cycle Arrow Heads */}
      <path d="M 12 36 L 15 28 L 22 33 Z" fill="#38BDF8" />
      <path d="M 52 28 L 49 36 L 42 31 Z" fill="#C084FC" />

      {/* Central Golden License Shield / Diamond Seal */}
      <g filter="url(#subGlow)">
        {/* Diamond Outer Rim */}
        <polygon points="32,18 46,32 32,46 18,32" fill="url(#subGoldCore)" stroke="#78350F" strokeWidth="1" />
        {/* Diamond Top Inner Facet */}
        <polygon points="32,21 43,32 32,32 21,32" fill="url(#subGoldFacet)" opacity="0.75" />
        {/* Center Sparkle Star */}
        <path
          d="M 32 25 Q 33 30 38 32 Q 33 34 32 39 Q 31 34 26 32 Q 31 30 32 25 Z"
          fill="#FFFFFF"
        />
        <circle cx="32" cy="32" r="1.5" fill="#FFFFFF" />
      </g>
    </svg>
  );
};
