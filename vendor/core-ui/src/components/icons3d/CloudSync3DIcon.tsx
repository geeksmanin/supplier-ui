import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const CloudSync3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Soft Sky Ground Glow */}
        <radialGradient id="csBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.65" />
          <stop offset="60%" stopColor="#0284C7" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#082F49" stopOpacity="0" />
        </radialGradient>

        {/* 3D Cloud Depth Extrusion */}
        <linearGradient id="csDepthGrad" x1="70" y1="26" x2="70" y2="124" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="55%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#082F49" />
        </linearGradient>

        {/* Front Cloud Body Gradient - Vibrant Sky Blue to Royal Azure */}
        <linearGradient id="csFrontGrad" x1="20" y1="18" x2="120" y2="114" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="25%" stopColor="#38BDF8" />
          <stop offset="65%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        {/* Cloud Upper Rim Light */}
        <linearGradient id="csRimGrad" x1="40" y1="18" x2="95" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#E0F2FE" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0.1" />
        </linearGradient>

        {/* Specular Highlight Sheen */}
        <linearGradient id="csHighlightTop" x1="50" y1="20" x2="90" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Central Recess Dial Inset */}
        <radialGradient id="csDialGrad" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#082F49" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#0C4A6E" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#03253B" stopOpacity="0.95" />
        </radialGradient>

        {/* Primary Arrow: Bright Neon White-Cyan */}
        <linearGradient id="csArrowCyan" x1="50" y1="52" x2="90" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#A5F3FC" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>

        {/* Secondary Arrow: Bright Aqua-Blue */}
        <linearGradient id="csArrowAqua" x1="90" y1="92" x2="50" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#67E8F9" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Satellite Node 1: Golden Amber Satellite */}
        <linearGradient id="csNodeAmber" x1="102" y1="28" x2="118" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Satellite Node 2: Emerald Mint Satellite */}
        <linearGradient id="csNodeEmerald" x1="24" y1="28" x2="40" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="40%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        <filter id="csShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#082F49" floodOpacity="0.55" />
        </filter>

        <filter id="csArrowGlow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="3.5" floodColor="#06B6D4" floodOpacity="0.7" />
        </filter>
      </defs>

      {/* Ground Glow & Contact Shadows */}
      <ellipse cx="70" cy="136" rx="48" ry="11.5" fill="url(#csBaseGlow)" />
      <ellipse cx="70" cy="134" rx="36" ry="7" fill="#082F49" opacity="0.45" />

      {/* Data stream pulses */}
      <path d="M32 38 Q 48 50 60 48" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" opacity="0.65" />
      <path d="M108 38 Q 92 48 80 48" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" opacity="0.65" />

      {/* 3D Cloud Depth Extrusion */}
      <path
        d="M44 48 C30 46 18 58 18 76 C18 94 30 106 46 106 L94 106 C110 106 122 94 122 76 C122 60 112 48 98 48 C95 32 83 22 70 22 C57 22 47 32 44 48 Z"
        fill="url(#csDepthGrad)"
        transform="translate(0, 8)"
      />

      {/* Main Front Cloud */}
      <g filter="url(#csShadow)">
        <path
          d="M44 48 C30 46 18 58 18 76 C18 94 30 106 46 106 L94 106 C110 106 122 94 122 76 C122 60 112 48 98 48 C95 32 83 22 70 22 C57 22 47 32 44 48 Z"
          fill="url(#csFrontGrad)"
          stroke="url(#csRimGrad)"
          strokeWidth="2.5"
        />
      </g>

      {/* Specular Highlights */}
      <path d="M52 44 C55 32 62 25 70 25 C78 25 85 32 88 44 C78 38 62 38 52 44 Z" fill="url(#csHighlightTop)" />
      <path d="M26 64 C24 54 30 47 40 47 C33 53 28 59 26 64 Z" fill="#FFFFFF" opacity="0.5" />

      {/* Central Recess Dial */}
      <ellipse cx="70" cy="76" rx="27" ry="27" fill="url(#csDialGrad)" stroke="#38BDF8" strokeWidth="1.8" strokeOpacity="0.45" />
      <ellipse cx="70" cy="76" rx="24" ry="24" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.18" />

      {/* Cloud Sync Arrows */}
      <g filter="url(#csArrowGlow)">
        <path d="M53 74 A17 17 0 0 1 85 64" stroke="url(#csArrowCyan)" strokeWidth="5" strokeLinecap="round" fill="none" />
        <polygon points="85,55 95,65 83,72" fill="#FFFFFF" />
        <path d="M87 78 A17 17 0 0 1 55 88" stroke="url(#csArrowAqua)" strokeWidth="5" strokeLinecap="round" fill="none" />
        <polygon points="55,97 45,87 57,80" fill="#FFFFFF" />
        <circle cx="70" cy="76" r="3.5" fill="#FFFFFF" />
        <circle cx="70" cy="76" r="6" fill="#38BDF8" opacity="0.35" />
      </g>

      {/* Floating Satellites */}
      <g filter="drop-shadow(0 4px 6px rgba(180,83,9,0.5))">
        <circle cx="108" cy="40" r="7.5" fill="#78350F" />
        <circle cx="108" cy="38" r="7.5" fill="url(#csNodeAmber)" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.7" />
        <circle cx="106" cy="36" r="2" fill="#FFFFFF" opacity="0.85" />
      </g>
      <g filter="drop-shadow(0 4px 6px rgba(4,120,87,0.5))">
        <circle cx="32" cy="40" r="6.5" fill="#064E3B" />
        <circle cx="32" cy="38" r="6.5" fill="url(#csNodeEmerald)" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.7" />
        <circle cx="30.5" cy="36.5" r="1.8" fill="#FFFFFF" opacity="0.85" />
      </g>
    </svg>
  );
};
