import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const WMS3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Roof Gradient */}
        <linearGradient id="wmsRoofGrad" x1="40" y1="20" x2="100" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        {/* Left Wall Gradient */}
        <linearGradient id="wmsLeftWall" x1="20" y1="50" x2="70" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>

        {/* Right Wall Gradient */}
        <linearGradient id="wmsRightWall" x1="70" y1="50" x2="120" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#082F49" />
        </linearGradient>

        {/* Roller Shutter Door */}
        <linearGradient id="wmsDoorGrad" x1="45" y1="80" x2="65" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Specular Highlight */}
        <linearGradient id="wmsHighlight" x1="30" y1="30" x2="80" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Base Glow */}
        <radialGradient id="wmsBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#0369A1" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#082F49" stopOpacity="0" />
        </radialGradient>

        {/* Soft Drop Shadow */}
        <filter id="wmsShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#082F49" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Ground Soft Glow */}
      <ellipse cx="70" cy="132" rx="42" ry="12" fill="url(#wmsBaseGlow)" />
      <ellipse cx="70" cy="130" rx="30" ry="8" fill="#0284C7" opacity="0.25" />

      {/* 3D Warehouse Structure */}
      <g filter="url(#wmsShadow)">
        {/* Left Side Wall */}
        <path
          d="M26 62 L70 84 L70 126 L26 104 Z"
          fill="url(#wmsLeftWall)"
        />

        {/* Right Side Wall */}
        <path
          d="M70 84 L114 62 L114 104 L70 126 Z"
          fill="url(#wmsRightWall)"
        />

        {/* Peaked Gabled Roof */}
        {/* Left Pitch */}
        <path
          d="M22 60 L70 32 L70 56 L22 84 Z"
          fill="url(#wmsRoofGrad)"
        />
        {/* Right Pitch */}
        <path
          d="M70 32 L118 60 L118 84 L70 56 Z"
          fill="#0369A1"
        />
      </g>

      {/* Roof Ridge Specular Flare */}
      <line x1="70" y1="32" x2="70" y2="56" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8" />
      <line x1="22" y1="60" x2="70" y2="32" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.5" />

      {/* Roller Shutter Bay Door (Left Facet) */}
      <polygon points="36,88 60,100 60,124 36,112" fill="url(#wmsDoorGrad)" />
      {/* Shutter Slats */}
      <line x1="36" y1="94" x2="60" y2="106" stroke="#B45309" strokeWidth="1.5" />
      <line x1="36" y1="100" x2="60" y2="112" stroke="#B45309" strokeWidth="1.5" />
      <line x1="36" y1="106" x2="60" y2="118" stroke="#B45309" strokeWidth="1.5" />

      {/* Warehouse Logistics Windows (Right Facet) */}
      <polygon points="80,74 94,67 94,81 80,88" fill="#38BDF8" opacity="0.85" />
      <polygon points="98,65 108,60 108,74 98,79" fill="#38BDF8" opacity="0.85" />

      {/* Small Floating Logistics Parcel */}
      <circle cx="94" cy="108" r="8" fill="#F59E0B" />
      <circle cx="94" cy="108" r="4" fill="#FFFFFF" />
    </svg>
  );
};
