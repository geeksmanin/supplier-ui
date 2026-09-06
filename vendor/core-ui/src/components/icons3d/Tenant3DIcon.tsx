import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Tenant3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Front Plate Gradient */}
        <linearGradient id="tntFrontGrad" x1="30" y1="20" x2="110" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="40%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Depth Extrusion */}
        <linearGradient id="tntDepthGrad" x1="25" y1="30" x2="115" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>

        {/* Gold Accent */}
        <linearGradient id="tntGoldGrad" x1="50" y1="10" x2="90" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Specular Highlight */}
        <linearGradient id="tntHighlight" x1="30" y1="20" x2="90" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Base Glow */}
        <radialGradient id="tntBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#059669" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#064E3B" stopOpacity="0" />
        </radialGradient>

        {/* Soft Drop Shadow */}
        <filter id="tntShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#064E3B" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Ground Soft Glow */}
      <ellipse cx="70" cy="132" rx="42" ry="12" fill="url(#tntBaseGlow)" />
      <ellipse cx="70" cy="130" rx="30" ry="8" fill="#10B981" opacity="0.25" />

      {/* 3D Extruded Rear Edge */}
      <rect x="25" y="24" width="90" height="106" rx="16" fill="url(#tntDepthGrad)" />

      {/* Main Front Identity Shield */}
      <g filter="url(#tntShadow)">
        <rect x="25" y="18" width="90" height="106" rx="16" fill="url(#tntFrontGrad)" />
      </g>

      {/* Top Surface Specular Flare */}
      <rect x="27" y="20" width="86" height="42" rx="14" fill="url(#tntHighlight)" />

      {/* Inner White Card Insert */}
      <rect x="34" y="32" width="72" height="82" rx="10" fill="#FFFFFF" opacity="0.95" />

      {/* 3D Corporate Building Monogram Relief */}
      {/* Tower Left */}
      <rect x="46" y="52" width="18" height="42" rx="3" fill="#059669" />
      <rect x="49" y="56" width="4" height="6" rx="1" fill="#FFFFFF" opacity="0.85" />
      <rect x="56" y="56" width="4" height="6" rx="1" fill="#FFFFFF" opacity="0.85" />
      <rect x="49" y="66" width="4" height="6" rx="1" fill="#FFFFFF" opacity="0.85" />
      <rect x="56" y="66" width="4" height="6" rx="1" fill="#FFFFFF" opacity="0.85" />
      <rect x="49" y="76" width="4" height="6" rx="1" fill="#FFFFFF" opacity="0.85" />
      <rect x="56" y="76" width="4" height="6" rx="1" fill="#FFFFFF" opacity="0.85" />

      {/* Tower Right (Taller) */}
      <rect x="66" y="44" width="22" height="50" rx="3" fill="#10B981" />
      <rect x="70" y="48" width="5" height="7" rx="1" fill="#FFFFFF" opacity="0.9" />
      <rect x="78" y="48" width="5" height="7" rx="1" fill="#FFFFFF" opacity="0.9" />
      <rect x="70" y="59" width="5" height="7" rx="1" fill="#FFFFFF" opacity="0.9" />
      <rect x="78" y="59" width="5" height="7" rx="1" fill="#FFFFFF" opacity="0.9" />
      <rect x="70" y="70" width="5" height="7" rx="1" fill="#FFFFFF" opacity="0.9" />
      <rect x="78" y="70" width="5" height="7" rx="1" fill="#FFFFFF" opacity="0.9" />

      {/* Floating Tenant Golden Plus / Star */}
      <circle cx="94" cy="40" r="13" fill="url(#tntGoldGrad)" />
      <path d="M94 33 L94 47 M87 40 L101 40" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />

      {/* Bottom Tenant Label Line */}
      <rect x="46" y="100" width="48" height="5" rx="2.5" fill="#A7F3D0" />
    </svg>
  );
};
