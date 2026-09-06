import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Settings3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Front Gear Face Gradient */}
        <linearGradient id="setGearFront" x1="30" y1="20" x2="110" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="35%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* 3D Depth Extrusion */}
        <linearGradient id="setGearDepth" x1="20" y1="60" x2="120" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* Metallic Bevel Rim */}
        <linearGradient id="setGearBevel" x1="30" y1="20" x2="110" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F1F5F9" />
          <stop offset="50%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>

        {/* Specular Flare */}
        <linearGradient id="setHighlight" x1="40" y1="25" x2="85" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Center Nut Accent */}
        <linearGradient id="setCenterGrad" x1="55" y1="55" x2="85" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Base Glow */}
        <radialGradient id="setBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#64748B" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#334155" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
        </radialGradient>

        {/* Soft Drop Shadow */}
        <filter id="setShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#0F172A" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Ground Glow */}
      <ellipse cx="70" cy="132" rx="42" ry="12" fill="url(#setBaseGlow)" />
      <ellipse cx="70" cy="130" rx="30" ry="8" fill="#64748B" opacity="0.25" />

      {/* 3D Extrusion Depth (Back/Bottom Offset) */}
      <g transform="translate(0, 8)" fill="url(#setGearDepth)">
        <path d="M64 16 L76 16 L78 28 C83 30 87 32 91 35 L101 27 L110 36 L102 46 C105 50 107 54 109 59 L121 61 L121 73 L109 75 C107 80 105 84 102 88 L110 98 L101 107 L91 99 C87 102 83 104 78 106 L76 118 L64 118 L62 106 C57 104 53 102 49 99 L39 107 L30 98 L38 88 C35 84 33 80 31 75 L19 73 L19 61 L31 59 C33 54 35 50 38 46 L30 36 L39 27 L49 35 C53 32 57 30 62 28 Z" />
      </g>

      {/* Front Gear Wheel */}
      <g filter="url(#setShadow)">
        <path
          d="M64 16 L76 16 L78 28 C83 30 87 32 91 35 L101 27 L110 36 L102 46 C105 50 107 54 109 59 L121 61 L121 73 L109 75 C107 80 105 84 102 88 L110 98 L101 107 L91 99 C87 102 83 104 78 106 L76 118 L64 118 L62 106 C57 104 53 102 49 99 L39 107 L30 98 L38 88 C35 84 33 80 31 75 L19 73 L19 61 L31 59 C33 54 35 50 38 46 L30 36 L39 27 L49 35 C53 32 57 30 62 28 Z"
          fill="url(#setGearFront)"
        />
      </g>

      {/* Outer Bevel Ring Accent */}
      <circle cx="70" cy="67" r="38" stroke="url(#setGearBevel)" strokeWidth="2.5" fill="none" opacity="0.6" />

      {/* Specular Highlight Flare */}
      <path
        d="M42 46 C50 34 62 28 70 28 C78 28 90 34 98 46 C88 38 78 36 70 36 C62 36 52 38 42 46 Z"
        fill="url(#setHighlight)"
      />

      {/* Center Depth Hole */}
      <circle cx="70" cy="67" r="20" fill="#0F172A" />
      <circle cx="70" cy="67" r="16" fill="url(#setCenterGrad)" />
      <circle cx="70" cy="67" r="8" fill="#0F172A" />
      <circle cx="67" cy="64" r="2.5" fill="#FFFFFF" opacity="0.75" />
    </svg>
  );
};
