import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Inventory3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Top Face Gradient */}
        <linearGradient id="invBoxTop" x1="40" y1="20" x2="100" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="60%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>

        {/* Left Face Gradient (Dark) */}
        <linearGradient id="invBoxLeft" x1="20" y1="50" x2="70" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6D28D9" />
          <stop offset="100%" stopColor="#4C1D95" />
        </linearGradient>

        {/* Right Face Gradient (Mid) */}
        <linearGradient id="invBoxRight" x1="70" y1="50" x2="120" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>

        {/* Packaging Tape Gradient */}
        <linearGradient id="invTapeGrad" x1="30" y1="30" x2="110" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Specular Highlight */}
        <linearGradient id="invBoxHighlight" x1="40" y1="25" x2="90" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Base Glow */}
        <radialGradient id="invBoxBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#6D28D9" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#4C1D95" stopOpacity="0" />
        </radialGradient>

        {/* Soft Drop Shadow */}
        <filter id="invBoxShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#4C1D95" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Ground Soft Glow */}
      <ellipse cx="70" cy="132" rx="42" ry="12" fill="url(#invBoxBaseGlow)" />
      <ellipse cx="70" cy="130" rx="30" ry="8" fill="#8B5CF6" opacity="0.25" />

      {/* 3D Isometric Crate Container */}
      <g filter="url(#invBoxShadow)">
        {/* Left Face */}
        <path
          d="M26 62 L70 86 L70 128 L26 104 Z"
          fill="url(#invBoxLeft)"
        />

        {/* Right Face */}
        <path
          d="M70 86 L114 62 L114 104 L70 128 Z"
          fill="url(#invBoxRight)"
        />

        {/* Top Face */}
        <path
          d="M70 36 L114 62 L70 86 L26 62 Z"
          fill="url(#invBoxTop)"
        />
      </g>

      {/* Top Face Specular Glare */}
      <path
        d="M70 37 L106 58 L70 76 L34 58 Z"
        fill="url(#invBoxHighlight)"
        opacity="0.8"
      />

      {/* Golden Packaging Tape Across Top Center */}
      <path
        d="M64 40 L76 46 L76 76 L64 70 Z"
        fill="url(#invTapeGrad)"
      />
      {/* Tape Continuing Down Left Face */}
      <path
        d="M64 70 L70 73 L70 128 L64 125 Z"
        fill="#D97706"
        opacity="0.9"
      />
      {/* Tape Continuing Down Right Face */}
      <path
        d="M70 73 L76 76 L76 125 L70 128 Z"
        fill="#B45309"
        opacity="0.9"
      />

      {/* Shipping Barcode Label on Right Face */}
      <g>
        <polygon points="80,76 106,62 106,86 80,100" fill="#FFFFFF" opacity="0.95" />
        <line x1="84" y1="78" x2="84" y2="92" stroke="#1E293B" strokeWidth="1.5" />
        <line x1="88" y1="76" x2="88" y2="90" stroke="#1E293B" strokeWidth="2" />
        <line x1="92" y1="74" x2="92" y2="88" stroke="#1E293B" strokeWidth="1" />
        <line x1="96" y1="72" x2="96" y2="86" stroke="#1E293B" strokeWidth="2.5" />
        <line x1="102" y1="68" x2="102" y2="82" stroke="#1E293B" strokeWidth="1.5" />
      </g>

      {/* Edges Rim Highlight */}
      <line x1="26" y1="62" x2="70" y2="86" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.4" />
      <line x1="70" y1="86" x2="114" y2="62" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.3" />
      <line x1="70" y1="86" x2="70" y2="128" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.25" />
    </svg>
  );
};
