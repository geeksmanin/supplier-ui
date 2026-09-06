import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Automations3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Bolt Front Face */}
        <linearGradient id="autoFrontGrad" x1="40" y1="15" x2="95" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="35%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Bolt Left Bevel Edge */}
        <linearGradient id="autoLeftBevel" x1="20" y1="20" x2="80" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#BFDBFE" />
          <stop offset="50%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>

        {/* Bolt Right Depth Shadow */}
        <linearGradient id="autoRightDepth" x1="50" y1="30" x2="110" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* Specular Flare */}
        <linearGradient id="autoHighlight" x1="50" y1="15" x2="80" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Base Glow */}
        <radialGradient id="autoBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
          <stop offset="70%" stopColor="#1D4ED8" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
        </radialGradient>

        {/* Soft Drop Shadow */}
        <filter id="autoShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#1E40AF" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Ground Glow */}
      <ellipse cx="70" cy="132" rx="42" ry="12" fill="url(#autoBaseGlow)" />
      <ellipse cx="70" cy="130" rx="30" ry="8" fill="#3B82F6" opacity="0.25" />

      {/* 3D Depth Extrusion (Back/Bottom Offset) */}
      <path
        d="M74 16 L40 76 L66 76 L52 130 L102 62 L74 62 Z"
        fill="url(#autoRightDepth)"
        transform="translate(6, 6)"
      />

      {/* Main Front Lightning Bolt */}
      <g filter="url(#autoShadow)">
        <path
          d="M74 16 L40 76 L66 76 L52 130 L102 62 L74 62 Z"
          fill="url(#autoFrontGrad)"
        />
      </g>

      {/* Left Specular Bevel Edge */}
      <path
        d="M74 16 L40 76 L52 76 L78 20 Z"
        fill="url(#autoLeftBevel)"
        opacity="0.85"
      />

      {/* Specular Highlight Streak */}
      <path
        d="M74 16 L60 48 L68 48 L76 22 Z"
        fill="url(#autoHighlight)"
      />

      {/* Center Power Glow Orb */}
      <circle cx="68" cy="68" r="6" fill="#FFFFFF" opacity="0.95" />
      <circle cx="68" cy="68" r="14" fill="#93C5FD" opacity="0.35" />

      {/* Floating Automation Sparkles */}
      <circle cx="34" cy="46" r="3" fill="#60A5FA" />
      <circle cx="106" cy="40" r="4" fill="#93C5FD" />
      <circle cx="98" cy="98" r="3" fill="#60A5FA" />
    </svg>
  );
};
