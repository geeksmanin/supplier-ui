import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Dashboard3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Tile 1 (Top Left) Gradient */}
        <linearGradient id="dshTile1" x1="25" y1="20" x2="65" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="60%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Tile 2 (Top Right) Gradient */}
        <linearGradient id="dshTile2" x1="75" y1="20" x2="115" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Tile 3 (Bottom Left) Gradient */}
        <linearGradient id="dshTile3" x1="25" y1="75" x2="65" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>

        {/* Tile 4 (Bottom Right) Gradient */}
        <linearGradient id="dshTile4" x1="75" y1="75" x2="115" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Depth Extrusion */}
        <linearGradient id="dshDepth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* Specular Highlight */}
        <linearGradient id="dshHighlight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Base Glow */}
        <radialGradient id="dshBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#1D4ED8" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
        </radialGradient>

        {/* Soft Drop Shadow */}
        <filter id="dshShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#0F172A" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Ground Soft Glow */}
      <ellipse cx="70" cy="132" rx="42" ry="12" fill="url(#dshBaseGlow)" />
      <ellipse cx="70" cy="130" rx="30" ry="8" fill="#3B82F6" opacity="0.25" />

      {/* 4 Floating Tiles Group with 3D Depth */}
      <g filter="url(#dshShadow)">
        {/* Tile 1 (Top Left) */}
        <rect x="25" y="22" width="38" height="42" rx="12" fill="url(#dshDepth)" transform="translate(0, 4)" />
        <rect x="25" y="20" width="38" height="42" rx="12" fill="url(#dshTile1)" />
        <rect x="27" y="22" width="34" height="18" rx="8" fill="url(#dshHighlight)" />
        {/* Bar chart inside Tile 1 */}
        <rect x="33" y="44" width="4" height="10" rx="2" fill="#FFFFFF" opacity="0.8" />
        <rect x="41" y="38" width="4" height="16" rx="2" fill="#FFFFFF" />
        <rect x="49" y="32" width="4" height="22" rx="2" fill="#FFFFFF" opacity="0.9" />

        {/* Tile 2 (Top Right) */}
        <rect x="75" y="22" width="38" height="30" rx="12" fill="url(#dshDepth)" transform="translate(0, 4)" />
        <rect x="75" y="20" width="38" height="30" rx="12" fill="url(#dshTile2)" />
        <rect x="77" y="22" width="34" height="14" rx="8" fill="url(#dshHighlight)" />
        {/* Sparkline in Tile 2 */}
        <path d="M83 38 L90 32 L98 36 L105 28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        {/* Tile 3 (Bottom Left) */}
        <rect x="25" y="74" width="38" height="42" rx="12" fill="url(#dshDepth)" transform="translate(0, 4)" />
        <rect x="25" y="72" width="38" height="42" rx="12" fill="url(#dshTile3)" />
        <rect x="27" y="74" width="34" height="18" rx="8" fill="url(#dshHighlight)" />
        {/* Pie circle inside Tile 3 */}
        <circle cx="44" cy="93" r="10" fill="#C7D2FE" opacity="0.85" />
        <path d="M44 93 L44 83 A10 10 0 0 1 54 93 Z" fill="#FFFFFF" />

        {/* Tile 4 (Bottom Right) */}
        <rect x="75" y="62" width="38" height="52" rx="12" fill="url(#dshDepth)" transform="translate(0, 4)" />
        <rect x="75" y="60" width="38" height="52" rx="12" fill="url(#dshTile4)" />
        <rect x="77" y="62" width="34" height="22" rx="8" fill="url(#dshHighlight)" />
        {/* Metric counter inside Tile 4 */}
        <circle cx="94" cy="82" r="8" fill="#FFFFFF" opacity="0.9" />
        <path d="M91 82 L93 84 L97 80" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="83" y="96" width="22" height="4" rx="2" fill="#D1FAE5" />
      </g>
    </svg>
  );
};
