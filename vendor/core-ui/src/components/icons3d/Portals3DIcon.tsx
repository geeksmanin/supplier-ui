import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Portals3DIcon: React.FC<Icon3DProps> = ({
  width = '100%',
  height = '100%',
  size,
  style,
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
        {/* Outer Indigo/Violet Arch Front */}
        <linearGradient id="ptlArchFront" x1="28" y1="16" x2="112" y2="124" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="45%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>

        {/* Extruded Side Depth */}
        <linearGradient id="ptlArchDepth" x1="24" y1="24" x2="118" y2="132" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4338CA" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>

        {/* Inner Luminous Vortex / Cyan-Teal Core */}
        <radialGradient id="ptlVortex" cx="50%" cy="48%" r="52%">
          <stop offset="0%" stopColor="#ECFEFF" />
          <stop offset="35%" stopColor="#22D3EE" />
          <stop offset="75%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </radialGradient>

        {/* Specular Highlight */}
        <linearGradient id="ptlHighlight" x1="34" y1="20" x2="96" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Orbital Badges */}
        <linearGradient id="ptlOrbEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="ptlOrbAmber" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="ptlOrbRose" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>

        {/* Ground Glow */}
        <radialGradient id="ptlBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#4338CA" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#312E81" stopOpacity="0" />
        </radialGradient>

        {/* Soft Drop Shadow */}
        <filter id="ptlShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#312E81" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Ground Glow & Rim */}
      <ellipse cx="70" cy="133" rx="44" ry="11" fill="url(#ptlBaseGlow)" />
      <ellipse cx="70" cy="131" rx="31" ry="7" fill="#6366F1" opacity="0.25" />

      {/* 3D Extruded Back Threshold Plate */}
      <rect x="26" y="24" width="88" height="104" rx="26" fill="url(#ptlArchDepth)" />

      {/* Main 3D Gateway Frame */}
      <g filter="url(#ptlShadow)">
        <rect x="26" y="18" width="88" height="104" rx="26" fill="url(#ptlArchFront)" />
      </g>

      {/* Top Specular Gloss */}
      <rect x="30" y="21" width="80" height="36" rx="22" fill="url(#ptlHighlight)" />

      {/* Recessed Portal Gateway Window */}
      <rect x="38" y="31" width="64" height="78" rx="18" fill="#1E1B4B" opacity="0.35" />
      <rect x="40" y="33" width="60" height="74" rx="16" fill="url(#ptlVortex)" />

      {/* Inner Concentric Light Rings */}
      <ellipse cx="70" cy="70" rx="22" ry="27" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.45" />
      <ellipse cx="70" cy="70" rx="13" ry="17" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.7" />
      <circle cx="70" cy="70" r="6" fill="#FFFFFF" opacity="0.95" />

      {/* Bottom Gateway Step Bar */}
      <rect x="34" y="110" width="72" height="7" rx="3.5" fill="#C7D2FE" opacity="0.9" />

      {/* Floating Multi-Portal Satellites (Customer, Samwad, Supplier) */}
      <circle cx="24" cy="48" r="11" fill="url(#ptlOrbEmerald)" />
      <circle cx="24" cy="48" r="4" fill="#FFFFFF" opacity="0.9" />

      <circle cx="116" cy="42" r="12" fill="url(#ptlOrbAmber)" />
      <path d="M116 36 L116 48 M110 42 L122 42" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />

      <circle cx="113" cy="96" r="10" fill="url(#ptlOrbRose)" />
      <circle cx="113" cy="96" r="3.5" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
};
