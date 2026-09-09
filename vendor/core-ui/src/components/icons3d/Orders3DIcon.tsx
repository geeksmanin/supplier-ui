import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Orders3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Cart Basket Main Emerald Gradient */}
        <linearGradient id="ord3dBasketGrad" x1="26" y1="38" x2="114" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="30%" stopColor="#10B981" />
          <stop offset="70%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Cart Depth Shadow Gradient */}
        <linearGradient id="ord3dDepthGrad" x1="30" y1="42" x2="108" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="100%" stopColor="#022C22" />
        </linearGradient>

        {/* Chrome Metallic Frame & Handle */}
        <linearGradient id="ord3dChrome" x1="16" y1="20" x2="120" y2="124" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#E2E8F0" />
          <stop offset="65%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Wheel Tire Rubber & Rim */}
        <linearGradient id="ord3dWheelTire" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="60%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="ord3dWheelRim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>

        {/* 3D Parcel Box Top Face */}
        <linearGradient id="ord3dBoxTop" x1="46" y1="22" x2="94" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="60%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        {/* 3D Parcel Box Left Face */}
        <linearGradient id="ord3dBoxLeft" x1="42" y1="44" x2="68" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        {/* 3D Parcel Box Right Face */}
        <linearGradient id="ord3dBoxRight" x1="68" y1="44" x2="96" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Ribbon Gradient */}
        <linearGradient id="ord3dRibbon" x1="40" y1="20" x2="100" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="40%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#BE123C" />
        </linearGradient>

        {/* Specular Front Flare */}
        <linearGradient id="ord3dHighlight" x1="30" y1="46" x2="100" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Base Ambient Glow */}
        <radialGradient id="ord3dBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#059669" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#064E3B" stopOpacity="0" />
        </radialGradient>

        {/* Drop Shadow Filter */}
        <filter id="ord3dShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#022C22" floodOpacity="0.55" />
        </filter>
        <filter id="ord3dCheckShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#064E3B" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Ground Ambient Reflection */}
      <ellipse cx="70" cy="132" rx="46" ry="12" fill="url(#ord3dBaseGlow)" />
      <ellipse cx="70" cy="130" rx="32" ry="7" fill="#10B981" opacity="0.3" />

      {/* Undercarriage Chassis Legs */}
      <path
        d="M34 94 L50 120 M78 94 L94 120 M50 120 L94 120"
        stroke="url(#ord3dChrome)"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Rear Wheel Left */}
      <g>
        <circle cx="50" cy="120" r="13" fill="url(#ord3dWheelTire)" />
        <circle cx="50" cy="120" r="8.5" fill="url(#ord3dWheelRim)" />
        <circle cx="50" cy="120" r="5" fill="#10B981" />
        <circle cx="50" cy="120" r="2" fill="#FFFFFF" />
        <ellipse cx="48" cy="114" rx="3" ry="1.5" fill="#FFFFFF" opacity="0.6" />
      </g>

      {/* Front Wheel Right */}
      <g>
        <circle cx="94" cy="120" r="13" fill="url(#ord3dWheelTire)" />
        <circle cx="94" cy="120" r="8.5" fill="url(#ord3dWheelRim)" />
        <circle cx="94" cy="120" r="5" fill="#10B981" />
        <circle cx="94" cy="120" r="2" fill="#FFFFFF" />
        <ellipse cx="92" cy="114" rx="3" ry="1.5" fill="#FFFFFF" opacity="0.6" />
      </g>

      {/* 3D Basket Solid Body with Depth */}
      <g filter="url(#ord3dShadow)">
        {/* Basket Back Lip & Depth Floor */}
        <path
          d="M24 44 L110 44 L102 90 L36 90 Z"
          fill="url(#ord3dDepthGrad)"
        />

        {/* 3D Isometric Golden Parcel Box inside Cart */}
        <g>
          {/* Box Shadow */}
          <ellipse cx="68" cy="66" rx="26" ry="6" fill="#022C22" opacity="0.6" />
          
          {/* Box Left Face */}
          <path d="M44 46 L68 56 L68 76 L44 64 Z" fill="url(#ord3dBoxLeft)" />
          {/* Box Right Face */}
          <path d="M68 56 L94 44 L94 62 L68 76 Z" fill="url(#ord3dBoxRight)" />
          {/* Box Top Face */}
          <path d="M68 28 L94 44 L68 56 L44 42 Z" fill="url(#ord3dBoxTop)" />

          {/* Red Gift Ribbon across Top & Sides */}
          {/* Ribbon on Top */}
          <path d="M56 35 L81 48 L76 52 L51 39 Z" fill="url(#ord3dRibbon)" />
          <path d="M81 36 L56 49 L51 45 L76 32 Z" fill="url(#ord3dRibbon)" opacity="0.9" />
          {/* Ribbon on Left Face */}
          <path d="M54 47 L60 50 L60 70 L54 67 Z" fill="#9F1239" />
          {/* Ribbon on Right Face */}
          <path d="M80 50 L86 47 L86 67 L80 70 Z" fill="#E11D48" />
          {/* Ribbon Bow on Top */}
          <circle cx="68" cy="42" r="4.5" fill="#BE123C" />
          <ellipse cx="64" cy="38" rx="4" ry="2.5" transform="rotate(-30 64 38)" fill="url(#ord3dRibbon)" />
          <ellipse cx="72" cy="38" rx="4" ry="2.5" transform="rotate(30 72 38)" fill="url(#ord3dRibbon)" />
          <circle cx="68" cy="42" r="2" fill="#FFFFFF" opacity="0.8" />
        </g>

        {/* Basket Front Tapered Face */}
        <path
          d="M26 48 L116 48 L104 94 L38 94 Z"
          fill="url(#ord3dBasketGrad)"
        />
      </g>

      {/* Basket Front Top Rim Bevel Highlight */}
      <path
        d="M26 48 L116 48"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeOpacity="0.8"
        strokeLinecap="round"
      />

      {/* Top Gloss Flare */}
      <path
        d="M28 50 L114 50 L108 66 L34 66 Z"
        fill="url(#ord3dHighlight)"
      />

      {/* Basket Wire Mesh Grid Lines with Gloss and Shadow */}
      <g stroke="#022C22" strokeWidth="2.5" strokeOpacity="0.3" strokeLinecap="round">
        <line x1="36" y1="64" x2="108" y2="64" />
        <line x1="39" y1="78" x2="103" y2="78" />
        <line x1="54" y1="52" x2="50" y2="92" />
        <line x1="72" y1="52" x2="68" y2="92" />
        <line x1="90" y1="52" x2="86" y2="92" />
      </g>
      <g stroke="#FFFFFF" strokeWidth="1.8" strokeOpacity="0.55" strokeLinecap="round">
        <line x1="35" y1="63" x2="107" y2="63" />
        <line x1="38" y1="77" x2="102" y2="77" />
        <line x1="53" y1="51" x2="49" y2="91" />
        <line x1="71" y1="51" x2="67" y2="91" />
        <line x1="89" y1="51" x2="85" y2="91" />
      </g>

      {/* Tubular Push Handle */}
      <path
        d="M18 32 L32 48"
        stroke="url(#ord3dChrome)"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      <circle cx="17" cy="30" r="6" fill="#10B981" />
      <circle cx="17" cy="30" r="3" fill="#FFFFFF" />

      {/* Floating 3D Verified Check Badge */}
      <g filter="url(#ord3dCheckShadow)">
        <circle cx="102" cy="36" r="16" fill="#064E3B" />
        <circle cx="101" cy="35" r="15" fill="#10B981" />
        <circle cx="101" cy="35" r="12" stroke="#A7F3D0" strokeWidth="1.5" fill="none" />
        <path
          d="M95 35 L99 39 L108 30"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse cx="98" cy="28" rx="4" ry="2" fill="#FFFFFF" opacity="0.8" />
      </g>
    </svg>
  );
};
