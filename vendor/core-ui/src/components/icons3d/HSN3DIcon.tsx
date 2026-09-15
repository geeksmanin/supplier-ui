import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const HSN3DIcon: React.FC<Icon3DProps> = ({
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
        <linearGradient id="hsnTopGrad" x1="40" y1="20" x2="100" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="60%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>

        <linearGradient id="hsnLeftGrad" x1="20" y1="50" x2="70" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#BE123C" />
          <stop offset="100%" stopColor="#881337" />
        </linearGradient>

        <linearGradient id="hsnRightGrad" x1="70" y1="50" x2="120" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#9F1239" />
        </linearGradient>

        <radialGradient id="hsnGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#881337" stopOpacity="0" />
        </radialGradient>

        <filter id="hsnShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#881337" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Ground Glow */}
      <ellipse cx="70" cy="132" rx="40" ry="12" fill="url(#hsnGlow)" />

      {/* 3D Tax Seal Block */}
      <g filter="url(#hsnShadow)">
        <path d="M26 50 L70 74 L70 120 L26 96 Z" fill="url(#hsnLeftGrad)" />
        <path d="M70 74 L114 50 L114 96 L70 120 Z" fill="url(#hsnRightGrad)" />
        <path d="M70 20 L114 50 L70 74 L26 50 Z" fill="url(#hsnTopGrad)" />
      </g>

      {/* Specular Rim */}
      <path d="M70 22 L106 46 L70 68 L34 46 Z" fill="#FFFFFF" opacity="0.35" />

      {/* Compliance / HSN Code Text Emblem */}
      <rect x="52" y="44" width="36" height="24" rx="4" fill="#FFE4E6" opacity="0.95" />
      <text
        x="70"
        y="60"
        textAnchor="middle"
        fontSize="12"
        fontWeight="900"
        fill="#9F1239"
        fontFamily="sans-serif"
      >
        HSN
      </text>
    </svg>
  );
};
