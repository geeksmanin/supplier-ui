import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Invoices3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Document Front Gradient */}
        <linearGradient id="invDocGrad" x1="35" y1="20" x2="105" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="40%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>

        {/* 3D Page Thickness/Extrusion */}
        <linearGradient id="invDepthGrad" x1="25" y1="25" x2="115" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#082F49" />
        </linearGradient>

        {/* Top-Right Corner Fold Gradient */}
        <linearGradient id="invFoldGrad" x1="80" y1="20" x2="110" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="100%" stopColor="#BAE6FD" />
        </linearGradient>

        {/* Coin Gradient */}
        <linearGradient id="invCoinGrad" x1="85" y1="80" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Specular Flare */}
        <linearGradient id="invHighlight" x1="35" y1="25" x2="90" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Base Glow */}
        <radialGradient id="invBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#0369A1" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#082F49" stopOpacity="0" />
        </radialGradient>

        {/* Soft Drop Shadow */}
        <filter id="invShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#082F49" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Ground Glow */}
      <ellipse cx="70" cy="132" rx="42" ry="12" fill="url(#invBaseGlow)" />
      <ellipse cx="70" cy="130" rx="30" ry="8" fill="#0284C7" opacity="0.25" />

      {/* 3D Extruded Rear Sheets */}
      <rect x="34" y="26" width="76" height="102" rx="14" fill="url(#invDepthGrad)" />
      <rect x="32" y="24" width="76" height="102" rx="14" fill="#0C4A6E" opacity="0.7" />

      {/* Main Front Document Sheet */}
      <g filter="url(#invShadow)">
        <path
          d="M30 32 C30 24 36 18 44 18 L88 18 L110 40 L110 114 C110 122 104 128 96 128 L44 128 C36 128 30 122 30 114 Z"
          fill="url(#invDocGrad)"
        />
      </g>

      {/* Front Surface Specular Flare */}
      <path
        d="M32 32 C32 26 36 20 44 20 L86 20 L44 80 L32 80 Z"
        fill="url(#invHighlight)"
        opacity="0.7"
      />

      {/* Folded Top-Right Corner */}
      <path
        d="M88 18 L88 36 C88 38 90 40 92 40 L110 40 Z"
        fill="url(#invFoldGrad)"
      />
      <path
        d="M88 40 L110 40 L88 18 Z"
        fill="#0369A1"
        opacity="0.3"
      />

      {/* Document Content Lines */}
      {/* Header Bar */}
      <rect x="42" y="34" width="38" height="6" rx="3" fill="#FFFFFF" opacity="0.9" />
      {/* Body Rows */}
      <rect x="42" y="48" width="56" height="4" rx="2" fill="#E0F2FE" opacity="0.75" />
      <rect x="42" y="58" width="56" height="4" rx="2" fill="#E0F2FE" opacity="0.75" />
      <rect x="42" y="68" width="46" height="4" rx="2" fill="#E0F2FE" opacity="0.75" />
      <rect x="42" y="78" width="36" height="4" rx="2" fill="#E0F2FE" opacity="0.75" />

      {/* Total Amount Badge */}
      <rect x="42" y="92" width="40" height="14" rx="6" fill="#0C4A6E" />
      <text x="62" y="103" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">PAID</text>

      {/* Floating 3D Gold Coin */}
      <g>
        <circle cx="100" cy="102" r="16" fill="#B45309" />
        <circle cx="98" cy="100" r="15" fill="url(#invCoinGrad)" />
        <circle cx="98" cy="100" r="12" stroke="#FEF3C7" strokeWidth="1.5" fill="none" />
        <text x="98" y="105" fill="#FFFFFF" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="Inter, sans-serif">₹</text>
        <ellipse cx="94" cy="94" rx="4" ry="2" fill="#FFFFFF" opacity="0.6" />
      </g>
    </svg>
  );
};
