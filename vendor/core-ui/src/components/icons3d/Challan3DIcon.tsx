import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Challan3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Cargo Container Main Amber Gradient */}
        <linearGradient id="chl3dBodyGrad" x1="18" y1="28" x2="88" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="35%" stopColor="#F97316" />
          <stop offset="75%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>

        {/* Cargo Top Roof Bevel */}
        <linearGradient id="chl3dRoofGrad" x1="20" y1="30" x2="84" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>

        {/* Truck Cabin Front Gradient */}
        <linearGradient id="chl3dCabGrad" x1="80" y1="40" x2="124" y2="102" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="45%" stopColor="#FB923C" />
          <stop offset="80%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>

        {/* Undercarriage Chassis Depth */}
        <linearGradient id="chl3dChassisGrad" x1="20" y1="88" x2="120" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* Chrome Bumper & Details */}
        <linearGradient id="chl3dChrome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#E2E8F0" />
          <stop offset="75%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Windshield Glass Reflection */}
        <linearGradient id="chl3dGlass" x1="86" y1="44" x2="114" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="40%" stopColor="#38BDF8" />
          <stop offset="80%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        {/* Specular Highlight on Container */}
        <linearGradient id="chl3dHighlight" x1="20" y1="34" x2="80" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Base Ambient Underglow */}
        <radialGradient id="chl3dBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#EA580C" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#7C2D12" stopOpacity="0" />
        </radialGradient>

        {/* Drop Shadow */}
        <filter id="chl3dShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#7C2D12" floodOpacity="0.55" />
        </filter>
      </defs>

      {/* Ground Ambient Reflection */}
      <ellipse cx="70" cy="132" rx="48" ry="12" fill="url(#chl3dBaseGlow)" />
      <ellipse cx="70" cy="130" rx="34" ry="7" fill="#F97316" opacity="0.3" />

      {/* 3D Vehicle Body with Filter Shadow */}
      <g filter="url(#chl3dShadow)">
        {/* Chassis Frame Solid Bar */}
        <rect x="20" y="88" width="100" height="14" rx="4" fill="url(#chl3dChassisGrad)" />

        {/* Cargo Container Box */}
        <rect x="20" y="32" width="66" height="60" rx="10" fill="url(#chl3dBodyGrad)" />

        {/* Truck Aerodynamic Cabin */}
        <path
          d="M86 46 C86 40 90 36 96 36 L106 36 C112 36 118 42 120 50 L124 72 C126 78 126 84 124 90 L122 96 C120 99 116 102 110 102 L86 102 Z"
          fill="url(#chl3dCabGrad)"
        />
      </g>

      {/* Cargo Roof Edge Highlight */}
      <path
        d="M20 40 C20 35.58 23.58 32 28 32 L82 32 C84 32 86 34 86 36 L86 42 L20 42 Z"
        fill="url(#chl3dRoofGrad)"
        opacity="0.8"
      />
      <line x1="28" y1="32" x2="82" y2="32" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.9" />

      {/* Cargo Side Ribs with Lighting */}
      <g stroke="#7C2D12" strokeWidth="2" strokeOpacity="0.4">
        <line x1="38" y1="44" x2="38" y2="88" />
        <line x1="52" y1="44" x2="52" y2="88" />
        <line x1="66" y1="44" x2="66" y2="88" />
      </g>
      <g stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.4">
        <line x1="39" y1="44" x2="39" y2="88" />
        <line x1="53" y1="44" x2="53" y2="88" />
        <line x1="67" y1="44" x2="67" y2="88" />
      </g>

      {/* Gloss Specular on Cargo Box */}
      <path
        d="M22 36 C22 34 26 34 32 34 L80 34 C82 34 84 38 84 48 L22 48 Z"
        fill="url(#chl3dHighlight)"
      />

      {/* Cabin Windshield Glass */}
      <path
        d="M92 42 L104 42 C108 42 112 46 114 52 L116 66 L92 66 Z"
        fill="url(#chl3dGlass)"
      />
      {/* Windshield Sun-Glare Reflection */}
      <path
        d="M94 44 L104 44 L96 64 L93 64 Z"
        fill="#FFFFFF"
        opacity="0.65"
      />

      {/* Cabin Side-View Mirror */}
      <rect x="84" y="52" width="4" height="10" rx="2" fill="url(#chl3dChrome)" />

      {/* Headlight with Glowing Halo */}
      <circle cx="122" cy="78" r="6" fill="#FBBF24" opacity="0.4" />
      <circle cx="122" cy="78" r="4.5" fill="#FEF08A" />
      <circle cx="122" cy="78" r="2" fill="#FFFFFF" />

      {/* Front Chrome Bumper */}
      <rect x="116" y="88" width="10" height="8" rx="3" fill="url(#chl3dChrome)" />

      {/* Heavy-Duty 3D Wheels */}
      {/* Wheel 1 (Rear Left) */}
      <g>
        <circle cx="40" cy="110" r="14" fill="#0F172A" />
        <circle cx="40" cy="110" r="10" fill="url(#chl3dChrome)" />
        <circle cx="40" cy="110" r="6" fill="#EA580C" />
        <circle cx="40" cy="110" r="2.5" fill="#FFFFFF" />
        <ellipse cx="38" cy="103" rx="3" ry="1.5" fill="#FFFFFF" opacity="0.6" />
      </g>

      {/* Wheel 2 (Middle) */}
      <g>
        <circle cx="68" cy="110" r="14" fill="#0F172A" />
        <circle cx="68" cy="110" r="10" fill="url(#chl3dChrome)" />
        <circle cx="68" cy="110" r="6" fill="#EA580C" />
        <circle cx="68" cy="110" r="2.5" fill="#FFFFFF" />
        <ellipse cx="66" cy="103" rx="3" ry="1.5" fill="#FFFFFF" opacity="0.6" />
      </g>

      {/* Wheel 3 (Front Cab) */}
      <g>
        <circle cx="106" cy="110" r="14" fill="#0F172A" />
        <circle cx="106" cy="110" r="10" fill="url(#chl3dChrome)" />
        <circle cx="106" cy="110" r="6" fill="#EA580C" />
        <circle cx="106" cy="110" r="2.5" fill="#FFFFFF" />
        <ellipse cx="104" cy="103" rx="3" ry="1.5" fill="#FFFFFF" opacity="0.6" />
      </g>

      {/* Dynamic Dispatch / Speed Streaks */}
      <path d="M10 48 L16 48 M6 60 L16 60 M10 72 L16 72" stroke="#FDBA74" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
};
