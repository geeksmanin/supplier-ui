import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Chat3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Main Bubble Face */}
        <linearGradient id="chatMainGrad" x1="25" y1="20" x2="105" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="40%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Main Bubble Depth */}
        <linearGradient id="chatDepthGrad" x1="25" y1="30" x2="105" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>

        {/* Small Bubble Gradient */}
        <linearGradient id="chatSmallGrad" x1="60" y1="70" x2="120" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Specular Flare */}
        <linearGradient id="chatHighlight" x1="30" y1="25" x2="80" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Base Glow */}
        <radialGradient id="chatBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#1D4ED8" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#172554" stopOpacity="0" />
        </radialGradient>

        {/* Soft Drop Shadow */}
        <filter id="chatShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#172554" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Ground Glow */}
      <ellipse cx="70" cy="132" rx="42" ry="12" fill="url(#chatBaseGlow)" />
      <ellipse cx="70" cy="130" rx="30" ry="8" fill="#2563EB" opacity="0.25" />

      {/* Large Main Bubble Depth Extrusion */}
      <path
        d="M32 30 C32 20 40 14 50 14 L94 14 C104 14 112 20 112 30 L112 70 C112 80 104 88 94 88 L58 88 L38 106 L42 88 L32 88 Z"
        fill="url(#chatDepthGrad)"
        transform="translate(0, 6)"
      />

      {/* Large Main Bubble Front Body */}
      <g filter="url(#chatShadow)">
        <path
          d="M30 26 C30 16 38 10 48 10 L92 10 C102 10 110 16 110 26 L110 66 C110 76 102 84 92 84 L56 84 L36 102 L40 84 L30 84 Z"
          fill="url(#chatMainGrad)"
        />
      </g>

      {/* Specular Highlight Arc */}
      <path
        d="M34 26 C34 18 40 14 48 14 L90 14 C90 14 60 46 34 46 Z"
        fill="url(#chatHighlight)"
        opacity="0.8"
      />

      {/* 3 Floating Typing Dots in Main Bubble */}
      <circle cx="56" cy="48" r="6" fill="#FFFFFF" />
      <circle cx="70" cy="48" r="6" fill="#FFFFFF" />
      <circle cx="84" cy="48" r="6" fill="#FFFFFF" />

      {/* Small Secondary Overlapping Bubble (Foreground) */}
      <g filter="drop-shadow(0 6px 12px rgba(15,23,42,0.35))">
        <path
          d="M72 74 C72 66 78 60 86 60 L116 60 C124 60 130 66 130 74 L130 98 C130 106 124 112 116 112 L108 112 L98 124 L100 112 L86 112 C78 112 72 106 72 98 Z"
          fill="url(#chatSmallGrad)"
        />
        {/* Specular Flare Small */}
        <path
          d="M74 74 C74 68 78 62 86 62 L114 62 C114 62 94 82 74 82 Z"
          fill="#FFFFFF"
          opacity="0.5"
        />
        {/* Heart / Check in Small Bubble */}
        <circle cx="95" cy="86" r="3" fill="#FFFFFF" />
        <circle cx="107" cy="86" r="3" fill="#FFFFFF" />
      </g>
    </svg>
  );
};
