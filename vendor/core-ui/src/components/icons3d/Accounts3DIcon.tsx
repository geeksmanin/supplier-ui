import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Accounts3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Coin Face Gradient */}
        <linearGradient id="accCoinFace" x1="30" y1="20" x2="110" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="35%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Outer Beveled Rim */}
        <linearGradient id="accRimGrad" x1="20" y1="10" x2="120" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="50%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>

        {/* 3D Extrusion Cylinder Edge */}
        <linearGradient id="accCylinderEdge" x1="20" y1="70" x2="120" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="50%" stopColor="#065F46" />
          <stop offset="100%" stopColor="#022C22" />
        </linearGradient>

        {/* Specular Flare */}
        <linearGradient id="accHighlight" x1="40" y1="25" x2="90" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Rupee Symbol Emboss Gradient */}
        <linearGradient id="accSymbolGrad" x1="50" y1="40" x2="90" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D1FAE5" />
        </linearGradient>

        {/* Base Glow */}
        <radialGradient id="accBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#059669" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#064E3B" stopOpacity="0" />
        </radialGradient>

        {/* Soft Drop Shadow */}
        <filter id="accShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#064E3B" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Ground Soft Glow */}
      <ellipse cx="70" cy="132" rx="42" ry="12" fill="url(#accBaseGlow)" />
      <ellipse cx="70" cy="130" rx="30" ry="8" fill="#10B981" opacity="0.25" />

      {/* 3D Extrusion Depth Layers (Cylinder Thickness) */}
      <path
        d="M22 68 C22 96 43 118 70 118 C97 118 118 96 118 68 L118 80 C118 108 97 130 70 130 C43 130 22 108 22 80 Z"
        fill="url(#accCylinderEdge)"
      />

      {/* Main Front Coin Disc */}
      <circle cx="70" cy="68" r="48" fill="url(#accRimGrad)" filter="url(#accShadow)" />
      <circle cx="70" cy="68" r="42" fill="url(#accCoinFace)" />

      {/* Inner Engraved Groove Ring */}
      <circle cx="70" cy="68" r="38" stroke="#A7F3D0" strokeWidth="2" strokeOpacity="0.6" strokeDasharray="6 4" fill="none" />

      {/* Top Half Surface Specular Arc */}
      <path
        d="M32 58 C35 38 51 24 70 24 C89 24 105 38 108 58 C94 48 78 44 70 44 C62 44 46 48 32 58 Z"
        fill="url(#accHighlight)"
      />

      {/* Embossed Indian Rupee (₹) Symbol */}
      <g filter="drop-shadow(0 2px 4px rgba(6,78,59,0.5))">
        {/* Top horizontal stroke */}
        <rect x="52" y="44" width="36" height="6.5" rx="3.25" fill="url(#accSymbolGrad)" />
        {/* Second horizontal stroke */}
        <rect x="52" y="56" width="32" height="6" rx="3" fill="url(#accSymbolGrad)" />
        {/* Curved spine */}
        <path
          d="M62 44 L62 76 C62 76 74 76 78 72 C82 68 82 58 74 56"
          stroke="url(#accSymbolGrad)"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Downward diagonal leg */}
        <path
          d="M65 72 L86 94"
          stroke="url(#accSymbolGrad)"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>

      {/* Small Star / Sparkle Accents */}
      <ellipse cx="44" cy="46" rx="4" ry="2" fill="#FFFFFF" opacity="0.6" />
      <circle cx="98" cy="42" r="3" fill="#FFFFFF" opacity="0.8" />
    </svg>
  );
};
