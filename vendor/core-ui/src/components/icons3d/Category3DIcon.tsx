import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Category3DIcon: React.FC<Icon3DProps> = ({
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
        <linearGradient id="catFolderTop" x1="30" y1="30" x2="110" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        <linearGradient id="catFolderLeft" x1="20" y1="60" x2="70" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#075985" />
          <stop offset="100%" stopColor="#0C4A6E" />
        </linearGradient>

        <linearGradient id="catFolderRight" x1="70" y1="60" x2="120" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>

        <radialGradient id="catFolderGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0C4A6E" stopOpacity="0" />
        </radialGradient>

        <filter id="catFolderShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#0C4A6E" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Base Glow */}
      <ellipse cx="70" cy="132" rx="40" ry="12" fill="url(#catFolderGlow)" />

      {/* 3D Folder Container */}
      <g filter="url(#catFolderShadow)">
        {/* Back Tab */}
        <path d="M30 38 C30 34 34 30 38 30 L60 30 L70 40 L102 40 C106 40 110 44 110 48 L110 65 L30 65 Z" fill="#0284C7" opacity="0.75" />
        
        {/* Folder Body Front Left */}
        <path d="M24 60 L70 82 L70 125 L24 103 Z" fill="url(#catFolderLeft)" />
        
        {/* Folder Body Front Right */}
        <path d="M70 82 L116 60 L116 103 L70 125 Z" fill="url(#catFolderRight)" />
        
        {/* Folder Top Opening Surface */}
        <path d="M70 38 L116 60 L70 82 L24 60 Z" fill="url(#catFolderTop)" />
      </g>

      {/* Inner Floating Document Pages */}
      <path d="M45 42 L80 58 L80 80 L45 64 Z" fill="#E0F2FE" opacity="0.9" />
      <path d="M55 46 L90 62 L90 84 L55 68 Z" fill="#FFFFFF" />

      {/* Top Specular Rim */}
      <path d="M70 40 L110 58 L70 76 L30 58 Z" fill="#FFFFFF" opacity="0.3" />
    </svg>
  );
};
