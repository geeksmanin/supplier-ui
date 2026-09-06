import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Backupsync3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Cloud Front Gradient */}
        <linearGradient id="syncCloudFront" x1="30" y1="20" x2="110" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="40%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>

        {/* Cloud Depth Gradient */}
        <linearGradient id="syncCloudDepth" x1="30" y1="40" x2="110" y2="115" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6B21A8" />
          <stop offset="100%" stopColor="#3B0764" />
        </linearGradient>

        {/* Sync Arrows Gradient */}
        <linearGradient id="syncArrowsGrad" x1="50" y1="50" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E9D5FF" />
        </linearGradient>

        {/* Specular Highlight */}
        <linearGradient id="syncHighlight" x1="30" y1="25" x2="80" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Base Glow */}
        <radialGradient id="syncBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9333EA" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#7E22CE" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#3B0764" stopOpacity="0" />
        </radialGradient>

        {/* Soft Drop Shadow */}
        <filter id="syncShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#3B0764" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Ground Glow */}
      <ellipse cx="70" cy="132" rx="42" ry="12" fill="url(#syncBaseGlow)" />
      <ellipse cx="70" cy="130" rx="30" ry="8" fill="#9333EA" opacity="0.25" />

      {/* 3D Extrusion Depth (Cloud Back Shadow) */}
      <path
        d="M44 48 C30 48 20 58 20 72 C20 86 32 96 46 96 L94 96 C108 96 120 86 120 72 C120 60 110 50 98 48 C96 34 84 24 70 24 C58 24 48 34 44 48 Z"
        fill="url(#syncCloudDepth)"
        transform="translate(0, 6)"
      />

      {/* Main Front Cloud Body */}
      <g filter="url(#syncShadow)">
        <path
          d="M44 48 C30 48 20 58 20 72 C20 86 32 96 46 96 L94 96 C108 96 120 86 120 72 C120 60 110 50 98 48 C96 34 84 24 70 24 C58 24 48 34 44 48 Z"
          fill="url(#syncCloudFront)"
        />
      </g>

      {/* Cloud Top Surface Specular Flare */}
      <path
        d="M46 48 C48 36 58 26 70 26 C82 26 92 34 94 46 C80 40 60 42 46 48 Z"
        fill="url(#syncHighlight)"
      />

      {/* 3D Circular Sync Arrows In Center */}
      <g filter="drop-shadow(0 2px 4px rgba(59,7,100,0.5))">
        {/* Upper Arc Arrow */}
        <path
          d="M56 70 A16 16 0 0 1 84 62"
          stroke="url(#syncArrowsGrad)"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
        <polygon points="84,54 92,62 82,68" fill="#FFFFFF" />

        {/* Lower Arc Arrow */}
        <path
          d="M84 74 A16 16 0 0 1 56 82"
          stroke="url(#syncArrowsGrad)"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
        <polygon points="56,90 48,82 58,76" fill="#FFFFFF" />
      </g>
    </svg>
  );
};
