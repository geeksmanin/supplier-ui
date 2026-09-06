import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Catalogue3DIcon: React.FC<Icon3DProps> = ({
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
        <linearGradient id="catTopGrad" x1="40" y1="20" x2="100" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="60%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#DB2777" />
        </linearGradient>

        {/* Left Face (Darker for 3D depth) */}
        <linearGradient id="catLeftGrad" x1="20" y1="50" x2="70" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#BE185D" />
          <stop offset="100%" stopColor="#831843" />
        </linearGradient>

        {/* Right Face (Medium tone) */}
        <linearGradient id="catRightGrad" x1="70" y1="50" x2="120" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#DB2777" />
          <stop offset="100%" stopColor="#9D174D" />
        </linearGradient>

        {/* Top Specular Highlight */}
        <linearGradient id="catHighlight" x1="50" y1="25" x2="90" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Floating Star / Gem Accent */}
        <linearGradient id="catGemGrad" x1="60" y1="10" x2="80" y2="35" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#EAB308" />
        </linearGradient>

        {/* Base Glow */}
        <radialGradient id="catBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EC4899" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#BE185D" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#831843" stopOpacity="0" />
        </radialGradient>

        {/* Soft Drop Shadow */}
        <filter id="catShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#831843" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Ground Glow */}
      <ellipse cx="70" cy="132" rx="42" ry="13" fill="url(#catBaseGlow)" />
      <ellipse cx="70" cy="130" rx="30" ry="8" fill="#EC4899" opacity="0.25" />

      {/* Main 3D Isometric Cube Container */}
      <g filter="url(#catShadow)">
        {/* Left Side Face */}
        <path
          d="M26 62 L70 86 L70 128 L26 104 Z"
          fill="url(#catLeftGrad)"
        />

        {/* Right Side Face */}
        <path
          d="M70 86 L114 62 L114 104 L70 128 Z"
          fill="url(#catRightGrad)"
        />

        {/* Top Face */}
        <path
          d="M70 36 L114 62 L70 86 L26 62 Z"
          fill="url(#catTopGrad)"
        />
      </g>

      {/* Top Face Specular Highlight Flare */}
      <path
        d="M70 37 L106 58 L70 76 L34 58 Z"
        fill="url(#catHighlight)"
        opacity="0.8"
      />

      {/* Isometric Open Flap Left */}
      <path
        d="M26 62 L18 40 L56 46 L70 66 Z"
        fill="#F472B6"
        opacity="0.85"
      />

      {/* Isometric Open Flap Right */}
      <path
        d="M114 62 L122 40 L84 46 L70 66 Z"
        fill="#F472B6"
        opacity="0.65"
      />

      {/* Top Edge Rim Highlight Lines */}
      <line x1="26" y1="62" x2="70" y2="86" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.4" />
      <line x1="70" y1="86" x2="114" y2="62" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.25" />
      <line x1="70" y1="86" x2="70" y2="128" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.2" />

      {/* Inside Product Glow Spheres */}
      <circle cx="70" cy="56" r="14" fill="#FBCFE8" opacity="0.9" />
      <circle cx="70" cy="56" r="9" fill="#FFFFFF" />

      {/* Floating Sparkle/Gem */}
      <path
        d="M70 16 L73 24 L81 27 L73 30 L70 38 L67 30 L59 27 L67 24 Z"
        fill="url(#catGemGrad)"
      />
      <circle cx="70" cy="27" r="2.5" fill="#FFFFFF" />
    </svg>
  );
};
