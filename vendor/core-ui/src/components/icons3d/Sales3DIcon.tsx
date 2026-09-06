import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Sales3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Cart Basket Main Gradient */}
        <linearGradient id="slsBasketGrad" x1="30" y1="30" x2="110" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="30%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#BE123C" />
        </linearGradient>

        {/* Cart Depth Gradient */}
        <linearGradient id="slsDepthGrad" x1="40" y1="40" x2="100" y2="115" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#881337" />
        </linearGradient>

        {/* Chrome Metallic Handle / Frame */}
        <linearGradient id="slsChrome" x1="20" y1="20" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="40%" stopColor="#CBD5E1" />
          <stop offset="75%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Wheel Hub Chrome */}
        <linearGradient id="slsWheelGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="50%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>

        {/* Gloss Specular */}
        <linearGradient id="slsHighlight" x1="40" y1="30" x2="90" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Base Glow */}
        <radialGradient id="slsBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#BE123C" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#881337" stopOpacity="0" />
        </radialGradient>

        {/* Soft Drop Shadow */}
        <filter id="slsShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#881337" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Ground Soft Glow */}
      <ellipse cx="70" cy="132" rx="42" ry="12" fill="url(#slsBaseGlow)" />
      <ellipse cx="70" cy="130" rx="30" ry="8" fill="#F43F5E" opacity="0.25" />

      {/* Wheels */}
      {/* Back Wheel Left */}
      <circle cx="50" cy="120" r="11" fill="url(#slsWheelGrad)" />
      <circle cx="50" cy="120" r="7" fill="#F43F5E" />
      <circle cx="50" cy="120" r="3.5" fill="#FFFFFF" />

      {/* Front Wheel Right */}
      <circle cx="94" cy="120" r="11" fill="url(#slsWheelGrad)" />
      <circle cx="94" cy="120" r="7" fill="#F43F5E" />
      <circle cx="94" cy="120" r="3.5" fill="#FFFFFF" />

      {/* Undercarriage Chassis Legs */}
      <path
        d="M32 94 L50 120 M78 94 L94 120 M50 120 L94 120"
        stroke="url(#slsChrome)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 3D Basket Solid Body with Depth */}
      <g filter="url(#slsShadow)">
        {/* Basket Back Lip & Depth */}
        <path
          d="M26 40 L108 40 L100 88 L38 88 Z"
          fill="url(#slsDepthGrad)"
        />

        {/* Basket Front Tapered Face */}
        <path
          d="M28 44 L114 44 L102 92 L42 92 Z"
          fill="url(#slsBasketGrad)"
        />
      </g>

      {/* Top Flare Specular */}
      <path
        d="M30 46 L112 46 L106 62 L36 62 Z"
        fill="url(#slsHighlight)"
        opacity="0.75"
      />

      {/* Basket Wire Mesh Grid Lines */}
      <g stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round">
        <line x1="36" y1="58" x2="108" y2="58" />
        <line x1="39" y1="74" x2="105" y2="74" />
        <line x1="56" y1="46" x2="52" y2="90" />
        <line x1="74" y1="46" x2="70" y2="90" />
        <line x1="92" y1="46" x2="88" y2="90" />
      </g>

      {/* Tubular Push Handle */}
      <path
        d="M20 28 L34 44"
        stroke="url(#slsChrome)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="18" cy="26" r="6" fill="#F43F5E" />
      <circle cx="18" cy="26" r="3" fill="#FFFFFF" />

      {/* Floating Goods / Gem in Cart */}
      <circle cx="70" cy="36" r="10" fill="#FDE047" opacity="0.95" />
      <circle cx="68" cy="33" r="3.5" fill="#FFFFFF" />
      <path
        d="M84 28 L94 38 L84 48 L74 38 Z"
        fill="#38BDF8"
        opacity="0.95"
      />
      <ellipse cx="84" cy="34" rx="2" ry="4" fill="#FFFFFF" opacity="0.8" />
    </svg>
  );
};
