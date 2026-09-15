import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Product3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Top Face Gradient */}
        <linearGradient id="prodTopGrad" x1="40" y1="20" x2="100" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        {/* Left Face (Darker for 3D depth) */}
        <linearGradient id="prodLeftGrad" x1="20" y1="50" x2="70" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>

        {/* Right Face (Medium tone) */}
        <linearGradient id="prodRightGrad" x1="70" y1="50" x2="120" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0C4A6E" />
        </linearGradient>

        {/* Specular Highlight */}
        <linearGradient id="prodHighlight" x1="50" y1="25" x2="90" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Ribbon / Seal Gradient */}
        <linearGradient id="prodRibbonGrad" x1="60" y1="30" x2="80" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#EAB308" />
        </linearGradient>

        {/* Ground Glow */}
        <radialGradient id="prodBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#0369A1" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#075985" stopOpacity="0" />
        </radialGradient>

        {/* Soft Drop Shadow */}
        <filter id="prodShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#0C4A6E" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Ground Glow */}
      <ellipse cx="70" cy="132" rx="42" ry="12" fill="url(#prodBaseGlow)" />
      <ellipse cx="70" cy="130" rx="28" ry="7" fill="#38BDF8" opacity="0.3" />

      {/* Main 3D Box */}
      <g filter="url(#prodShadow)">
        {/* Left Side Face */}
        <path d="M26 54 L70 78 L70 124 L26 100 Z" fill="url(#prodLeftGrad)" />

        {/* Right Side Face */}
        <path d="M70 78 L114 54 L114 100 L70 124 Z" fill="url(#prodRightGrad)" />

        {/* Top Face */}
        <path d="M70 24 L114 54 L70 78 L26 54 Z" fill="url(#prodTopGrad)" />
      </g>

      {/* Top Specular Highlight */}
      <path d="M70 26 L108 52 L70 74 L32 52 Z" fill="url(#prodHighlight)" />

      {/* Product Seal Ribbon */}
      <path d="M58 32 L82 48 L82 110 L58 94 Z" fill="url(#prodRibbonGrad)" opacity="0.9" />

      {/* Product Package Emblem / Barcode Lines */}
      <g fill="#FFFFFF" opacity="0.85">
        <rect x="36" y="70" width="18" height="3" rx="1.5" transform="skewY(15)" />
        <rect x="36" y="76" width="24" height="3" rx="1.5" transform="skewY(15)" />
        <rect x="36" y="82" width="12" height="3" rx="1.5" transform="skewY(15)" />
      </g>

      {/* Floating 3D Star Badge */}
      <g filter="url(#prodShadow)">
        <polygon points="70,14 74,24 85,24 76,31 79,41 70,35 61,41 64,31 55,24 66,24" fill="#FDE047" />
      </g>
    </svg>
  );
};
