import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const CRM3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Outer Ring Gradient */}
        <linearGradient id="crmOuterGrad" x1="25" y1="20" x2="115" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        {/* Cylinder Depth Gradient */}
        <linearGradient id="crmDepthGrad" x1="25" y1="70" x2="115" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#082F49" />
        </linearGradient>

        {/* Mid Ring Gradient */}
        <linearGradient id="crmMidGrad" x1="40" y1="35" x2="100" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#BAE6FD" />
        </linearGradient>

        {/* Center Bullseye Gradient */}
        <linearGradient id="crmBullseye" x1="55" y1="50" x2="85" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#BE123C" />
        </linearGradient>

        {/* 3D Arrow Gradient */}
        <linearGradient id="crmArrowGrad" x1="75" y1="15" x2="120" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Specular Highlight */}
        <linearGradient id="crmHighlight" x1="35" y1="25" x2="85" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Base Glow */}
        <radialGradient id="crmBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#0369A1" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#082F49" stopOpacity="0" />
        </radialGradient>

        {/* Soft Drop Shadow */}
        <filter id="crmShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#082F49" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Ground Soft Glow */}
      <ellipse cx="70" cy="132" rx="42" ry="12" fill="url(#crmBaseGlow)" />
      <ellipse cx="70" cy="130" rx="30" ry="8" fill="#0284C7" opacity="0.25" />

      {/* 3D Cylindrical Depth */}
      <path
        d="M24 70 C24 96 45 118 70 118 C95 118 116 96 116 70 L116 80 C116 106 95 128 70 128 C45 128 24 106 24 80 Z"
        fill="url(#crmDepthGrad)"
      />

      {/* Main Target Disc */}
      <circle cx="70" cy="70" r="46" fill="url(#crmOuterGrad)" filter="url(#crmShadow)" />

      {/* White Ring */}
      <circle cx="70" cy="70" r="34" fill="url(#crmMidGrad)" />

      {/* Cyan Inner Ring */}
      <circle cx="70" cy="70" r="24" fill="url(#crmOuterGrad)" />

      {/* Red Center Bullseye */}
      <circle cx="70" cy="70" r="14" fill="url(#crmBullseye)" />
      <circle cx="70" cy="70" r="6" fill="#FFFFFF" />

      {/* Specular Highlight Arc */}
      <path
        d="M36 58 C40 40 54 28 70 28 C86 28 100 40 104 58 C92 48 78 44 70 44 C62 44 48 48 36 58 Z"
        fill="url(#crmHighlight)"
      />

      {/* 3D Dart Arrow Piercing Bullseye */}
      <g filter="drop-shadow(0 4px 6px rgba(15,23,42,0.4))">
        {/* Shaft */}
        <line x1="70" y1="70" x2="108" y2="32" stroke="url(#crmArrowGrad)" strokeWidth="6" strokeLinecap="round" />
        {/* Arrow Flight Fins */}
        <polygon points="106,34 118,22 122,26 110,38" fill="#F43F5E" />
        <polygon points="104,36 114,20 120,24 110,40" fill="#E11D48" opacity="0.85" />
      </g>
    </svg>
  );
};
