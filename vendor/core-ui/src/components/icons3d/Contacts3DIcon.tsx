import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Contacts3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Front Face Gradient */}
        <linearGradient id="cntFrontGrad" x1="30" y1="20" x2="110" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Thickness/Depth Gradient */}
        <linearGradient id="cntDepthGrad" x1="20" y1="30" x2="120" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Highlight Gradient */}
        <linearGradient id="cntHighlight" x1="40" y1="25" x2="100" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Clip Lanyard Metallic */}
        <linearGradient id="cntClipGrad" x1="60" y1="10" x2="80" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Inner Card Gradient */}
        <linearGradient id="cntInnerGrad" x1="45" y1="40" x2="95" y2="115" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FEF3C7" />
        </linearGradient>

        {/* Base Glow */}
        <radialGradient id="cntBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#D97706" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#78350F" stopOpacity="0" />
        </radialGradient>

        {/* Soft Drop Shadow */}
        <filter id="cntShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#78350F" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Ground Soft Glow */}
      <ellipse cx="70" cy="132" rx="40" ry="12" fill="url(#cntBaseGlow)" />
      <ellipse cx="70" cy="130" rx="30" ry="8" fill="#F59E0B" opacity="0.25" />

      {/* Top Clip Connector */}
      <rect x="62" y="10" width="16" height="14" rx="4" fill="url(#cntClipGrad)" />
      <rect x="66" y="13" width="8" height="4" rx="2" fill="#334155" />

      {/* 3D Extrusion Bottom/Sides */}
      <rect x="25" y="24" width="90" height="106" rx="16" fill="url(#cntDepthGrad)" />
      <rect x="25" y="22" width="90" height="106" rx="16" fill="url(#cntDepthGrad)" opacity="0.8" />

      {/* Main Front Badge Plate */}
      <rect x="25" y="18" width="90" height="106" rx="16" fill="url(#cntFrontGrad)" filter="url(#cntShadow)" />

      {/* Front Surface Specular Flare */}
      <rect x="27" y="20" width="86" height="40" rx="14" fill="url(#cntHighlight)" />

      {/* White Inner Card Insert */}
      <rect x="34" y="32" width="72" height="82" rx="10" fill="url(#cntInnerGrad)" />

      {/* Left Avatar (Primary) */}
      {/* Head */}
      <circle cx="62" cy="56" r="12" fill="#D97706" />
      <circle cx="60" cy="54" r="10" fill="#F59E0B" />
      <ellipse cx="58" cy="50" rx="4" ry="2" fill="#FFFFFF" opacity="0.5" />
      {/* Torso */}
      <path
        d="M44 86 C44 74 52 72 62 72 C72 72 80 74 80 86"
        fill="#D97706"
      />
      <path
        d="M46 86 C46 75 53 73 62 73 C71 73 78 75 78 86"
        fill="#F59E0B"
      />

      {/* Right Avatar (Secondary team member) */}
      <circle cx="82" cy="62" r="9" fill="#B45309" />
      <circle cx="81" cy="60" r="8" fill="#D97706" />
      <path
        d="M72 88 C72 79 78 78 86 78 C94 78 98 80 98 88"
        fill="#B45309"
      />

      {/* Bottom ID Badge Accent Lines */}
      <rect x="42" y="96" width="38" height="5" rx="2.5" fill="#F59E0B" />
      <rect x="42" y="104" width="22" height="4" rx="2" fill="#FCD34D" />
      <circle cx="90" cy="101" r="5" fill="#10B981" />
      <circle cx="90" cy="101" r="2.5" fill="#FFFFFF" />
    </svg>
  );
};
