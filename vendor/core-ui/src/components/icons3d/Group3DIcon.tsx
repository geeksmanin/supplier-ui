import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Group3DIcon: React.FC<Icon3DProps> = ({
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
        <linearGradient id="grpTopGrad" x1="40" y1="20" x2="100" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="60%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>

        <linearGradient id="grpLeftGrad" x1="20" y1="50" x2="70" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7E22CE" />
          <stop offset="100%" stopColor="#581C87" />
        </linearGradient>

        <linearGradient id="grpRightGrad" x1="70" y1="50" x2="120" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#6B21A8" />
        </linearGradient>

        <radialGradient id="grpGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#581C87" stopOpacity="0" />
        </radialGradient>

        <filter id="grpShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#581C87" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Ground Glow */}
      <ellipse cx="70" cy="132" rx="40" ry="12" fill="url(#grpGlow)" />

      {/* 3D Stack of Groups/Tags */}
      <g filter="url(#grpShadow)">
        {/* Rear Node */}
        <circle cx="45" cy="45" r="16" fill="#7E22CE" />
        <circle cx="45" cy="45" r="10" fill="#E9D5FF" />

        {/* Rear Node Right */}
        <circle cx="95" cy="45" r="16" fill="#9333EA" />
        <circle cx="95" cy="45" r="10" fill="#F3E8FF" />

        {/* Center Main Isometric Box Base */}
        <path d="M26 70 L70 94 L70 125 L26 101 Z" fill="url(#grpLeftGrad)" />
        <path d="M70 94 L114 70 L114 101 L70 125 Z" fill="url(#grpRightGrad)" />
        <path d="M70 38 L114 70 L70 94 L26 70 Z" fill="url(#grpTopGrad)" />
      </g>

      {/* Specular Rim */}
      <path d="M70 40 L106 66 L70 88 L34 66 Z" fill="#FFFFFF" opacity="0.35" />

      {/* Front Center Node Orb */}
      <circle cx="70" cy="66" r="14" fill="#F3E8FF" opacity="0.95" />
      <circle cx="70" cy="66" r="8" fill="#A855F7" />
    </svg>
  );
};
