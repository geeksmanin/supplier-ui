import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const PurchaseOrder3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Front Bag Face Gradient */}
        <linearGradient id="poFrontGrad" x1="40" y1="35" x2="105" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="35%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>

        {/* Side Gusset / Fold Face */}
        <linearGradient id="poSideGrad" x1="20" y1="40" x2="50" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>

        {/* Handle Metallic Gradient */}
        <linearGradient id="poHandleGrad" x1="50" y1="10" x2="90" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Tag Golden Gradient */}
        <linearGradient id="poTagGrad" x1="85" y1="50" x2="105" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Gloss Specular Flare */}
        <linearGradient id="poHighlight" x1="40" y1="40" x2="90" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Base Glow */}
        <radialGradient id="poBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#1D4ED8" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#172554" stopOpacity="0" />
        </radialGradient>

        {/* Soft Drop Shadow */}
        <filter id="poShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#172554" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Ground Soft Glow */}
      <ellipse cx="70" cy="132" rx="42" ry="12" fill="url(#poBaseGlow)" />
      <ellipse cx="70" cy="130" rx="30" ry="8" fill="#2563EB" opacity="0.25" />

      {/* 3D Curved Handles */}
      {/* Back Handle */}
      <path
        d="M52 46 C52 20 88 20 88 46"
        stroke="#1E40AF"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* 3D Bag Solid Body */}
      <g filter="url(#poShadow)">
        {/* Left Depth Fold (Gusset) */}
        <path
          d="M32 46 L46 46 L40 126 L22 122 Z"
          fill="url(#poSideGrad)"
        />

        {/* Main Front Face */}
        <path
          d="M44 46 L112 46 L118 126 L40 126 Z"
          fill="url(#poFrontGrad)"
        />
      </g>

      {/* Front Surface Specular Highlight */}
      <path
        d="M46 48 L110 48 L114 74 L44 74 Z"
        fill="url(#poHighlight)"
        opacity="0.8"
      />

      {/* Front Handle */}
      <path
        d="M58 46 C58 22 94 22 94 46"
        stroke="url(#poHandleGrad)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Top Fold Crease Line */}
      <line x1="44" y1="52" x2="112" y2="52" stroke="#93C5FD" strokeWidth="2" strokeOpacity="0.6" />

      {/* Hanging Supplier PO Tag */}
      <g>
        {/* Tag String */}
        <line x1="94" y1="46" x2="98" y2="60" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
        {/* Tag Body */}
        <polygon points="92,60 106,60 114,84 88,84" fill="url(#poTagGrad)" />
        <circle cx="99" cy="64" r="2" fill="#78350F" />
        <line x1="93" y1="72" x2="107" y2="72" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <line x1="95" y1="78" x2="105" y2="78" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Center PO Shield Check Mark */}
      <circle cx="78" cy="88" r="14" fill="#FFFFFF" opacity="0.95" />
      <path
        d="M72 88 L76 92 L84 84"
        stroke="#2563EB"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
