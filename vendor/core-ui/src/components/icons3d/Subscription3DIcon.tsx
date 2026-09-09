import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Subscription3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Main Ribbon Loop 1 (Cyan / Teal) */}
        <linearGradient id="sub3dRingGrad1" x1="16" y1="18" x2="124" y2="124" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="35%" stopColor="#06B6D4" />
          <stop offset="75%" stopColor="#0891B2" />
          <stop offset="100%" stopColor="#0E7490" />
        </linearGradient>

        {/* Secondary Ribbon Loop 2 (Purple / Indigo) */}
        <linearGradient id="sub3dRingGrad2" x1="24" y1="24" x2="116" y2="116" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="45%" stopColor="#9333EA" />
          <stop offset="85%" stopColor="#7E22CE" />
          <stop offset="100%" stopColor="#581C87" />
        </linearGradient>

        {/* 3D Brilliant Diamond Core Gradient */}
        <linearGradient id="sub3dDiamondGrad" x1="48" y1="36" x2="92" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="30%" stopColor="#FDE047" />
          <stop offset="70%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Diamond Facet 1 (Top Left) */}
        <linearGradient id="sub3dFacetTL" x1="46" y1="40" x2="70" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FEF08A" />
        </linearGradient>

        {/* Diamond Facet 2 (Top Right) */}
        <linearGradient id="sub3dFacetTR" x1="70" y1="40" x2="94" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Diamond Facet 3 (Bottom Left) */}
        <linearGradient id="sub3dFacetBL" x1="46" y1="68" x2="70" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Diamond Facet 4 (Bottom Right) */}
        <linearGradient id="sub3dFacetBR" x1="70" y1="68" x2="94" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Arrow Metallic Chrome Bevel */}
        <linearGradient id="sub3dArrowChrome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        {/* Base Ambient Glow */}
        <radialGradient id="sub3dBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#9333EA" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#164E63" stopOpacity="0" />
        </radialGradient>

        {/* Soft Drop Shadow Filter */}
        <filter id="sub3dShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#164E63" floodOpacity="0.55" />
        </filter>
        <filter id="sub3dDiamondShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#78350F" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Ground Ambient Reflection */}
      <ellipse cx="70" cy="132" rx="46" ry="12" fill="url(#sub3dBaseGlow)" />
      <ellipse cx="70" cy="130" rx="32" ry="7" fill="#06B6D4" opacity="0.3" />

      {/* 3D Recurring Loop Body */}
      <g filter="url(#sub3dShadow)">
        {/* Rear Loop Arc (Purple) */}
        <path
          d="M70 20 C44 20 22 42 22 68 C22 84 31 98 44 106 L44 92 C36 86 32 78 32 68 C32 47 49 30 70 30 C91 30 108 47 108 68 C108 78 104 86 96 92 L96 106 C109 98 118 84 118 68 C118 42 96 20 70 20 Z"
          fill="url(#sub3dRingGrad2)"
        />

        {/* Front Loop Arc (Cyan / Teal) */}
        <path
          d="M70 20 C96 20 118 42 118 68 C118 84 109 98 96 106 L96 92 C104 86 108 78 108 68 C108 47 91 30 70 30 C49 30 32 47 32 68 C32 78 36 86 44 92 L44 106 C31 98 22 84 22 68 C22 42 44 20 70 20 Z"
          fill="url(#sub3dRingGrad1)"
        />

        {/* Arrow Head 1 (Top-Right Heading Down) */}
        <polygon points="90,88 106,118 124,96" fill="url(#sub3dRingGrad1)" />
        <polygon points="90,88 106,118 106,94" fill="#0E7490" />

        {/* Arrow Head 2 (Bottom-Left Heading Up) */}
        <polygon points="50,88 34,118 16,96" fill="url(#sub3dRingGrad2)" />
        <polygon points="50,88 34,118 34,94" fill="#581C87" />
      </g>

      {/* Ring Outer Rim Highlight Arc */}
      <path
        d="M34 46 C42 34 55 24 70 24 C85 24 98 34 106 46"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />

      {/* Floating 3D Brilliant Diamond Jewel */}
      <g filter="url(#sub3dDiamondShadow)">
        {/* Diamond Outer Shadow Base */}
        <polygon points="70,38 96,68 70,98 44,68" fill="#78350F" />

        {/* Facet Top-Left */}
        <polygon points="70,40 46,68 70,68" fill="url(#sub3dFacetTL)" />
        {/* Facet Top-Right */}
        <polygon points="70,40 94,68 70,68" fill="url(#sub3dFacetTR)" />
        {/* Facet Bottom-Left */}
        <polygon points="46,68 70,96 70,68" fill="url(#sub3dFacetBL)" />
        {/* Facet Bottom-Right */}
        <polygon points="94,68 70,96 70,68" fill="url(#sub3dFacetBR)" />

        {/* Inner Diamond Table Facet */}
        <polygon points="70,48 84,68 70,88 56,68" fill="#FEF08A" opacity="0.6" />

        {/* Center Specular Sparkle */}
        <circle cx="70" cy="68" r="4.5" fill="#FFFFFF" />
        <ellipse cx="62" cy="54" rx="2.5" ry="6" transform="rotate(-30 62 54)" fill="#FFFFFF" opacity="0.85" />
      </g>

      {/* Brilliant 4-Point Sparkle Stars */}
      <path d="M106 32 L109 42 L119 45 L109 48 L106 58 L103 48 L93 45 L103 42 Z" fill="#FDE047" />
      <path d="M26 42 L28 48 L34 50 L28 52 L26 58 L24 52 L18 50 L24 48 Z" fill="#67E8F9" />
    </svg>
  );
};
