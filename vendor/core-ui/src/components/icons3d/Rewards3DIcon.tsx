import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Rewards3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Soft Gold Outer Base / Glow */}
        <radialGradient id="rewBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#D97706" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#78350F" stopOpacity="0" />
        </radialGradient>

        {/* 3D Extrusion Cylinder Edge (Dark Rich Gold) */}
        <linearGradient id="rewCylinderEdge" x1="20" y1="70" x2="120" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="50%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Beveled Outer Rim */}
        <linearGradient id="rewRimGrad" x1="20" y1="10" x2="120" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Main Medal / Disc Face */}
        <linearGradient id="rewMedalFace" x1="30" y1="20" x2="110" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="25%" stopColor="#FBBF24" />
          <stop offset="70%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Specular Flare / Highlight */}
        <linearGradient id="rewHighlight" x1="40" y1="25" x2="90" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* 3D Star & Trophy Emboss Gradient */}
        <linearGradient id="rewStarGrad" x1="50" y1="40" x2="90" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FCD34D" />
        </linearGradient>

        {/* Ribbon Left (Royal Sapphire Blue) */}
        <linearGradient id="rewRibbonLeft" x1="35" y1="10" x2="55" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>

        {/* Ribbon Right (Royal Sapphire Blue) */}
        <linearGradient id="rewRibbonRight" x1="85" y1="10" x2="105" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Pedestal Base Gradient */}
        <linearGradient id="rewPedestalGrad" x1="30" y1="110" x2="110" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* Soft Drop Shadow */}
        <filter id="rewShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#78350F" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Ground Soft Glow */}
      <ellipse cx="70" cy="134" rx="44" ry="12" fill="url(#rewBaseGlow)" />

      {/* Top Ribbon Ties */}
      <path d="M42 12 L56 12 L64 45 L50 45 Z" fill="url(#rewRibbonLeft)" />
      <path d="M84 12 L98 12 L90 45 L76 45 Z" fill="url(#rewRibbonRight)" />
      <path d="M42 12 L48 24 L56 12 Z" fill="#172554" opacity="0.6" />
      <path d="M84 12 L92 24 L98 12 Z" fill="#172554" opacity="0.6" />

      {/* 3D Extrusion Depth Layers (Thickness) */}
      <path
        d="M22 72 C22 100 43 122 70 122 C97 122 118 100 118 72 L118 84 C118 112 97 134 70 134 C43 134 22 112 22 84 Z"
        fill="url(#rewCylinderEdge)"
      />

      {/* Main Front Medal Disc */}
      <circle cx="70" cy="72" r="48" fill="url(#rewRimGrad)" filter="url(#rewShadow)" />
      <circle cx="70" cy="72" r="42" fill="url(#rewMedalFace)" />

      {/* Inner Engraved Stitched Rim */}
      <circle cx="70" cy="72" r="38" stroke="#FDE68A" strokeWidth="2" strokeOpacity="0.75" strokeDasharray="5 3" fill="none" />

      {/* Top Half Surface Specular Arc */}
      <path
        d="M32 62 C35 42 51 28 70 28 C89 28 105 42 108 62 C94 52 78 48 70 48 C62 48 46 52 32 62 Z"
        fill="url(#rewHighlight)"
      />

      {/* Embossed 3D Star in Center */}
      <g filter="drop-shadow(0 3px 6px rgba(120,53,15,0.65))">
        {/* Five-point star */}
        <polygon
          points="70,44 76,58 91,59 79,69 83,84 70,75 57,84 61,69 49,59 64,58"
          fill="url(#rewStarGrad)"
          stroke="#F59E0B"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Star central diamond facet highlight */}
        <polygon
          points="70,45 74,58 70,72 66,58"
          fill="#FFFFFF"
          opacity="0.8"
        />
      </g>

      {/* Laurels / Wreath Accents */}
      <path
        d="M38 78 C38 90 48 98 58 102"
        stroke="#FDE68A"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M102 78 C102 90 92 98 82 102"
        stroke="#FDE68A"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {/* Sparkle Glints */}
      <ellipse cx="44" cy="48" rx="4" ry="2" fill="#FFFFFF" opacity="0.8" />
      <circle cx="98" cy="46" r="3" fill="#FFFFFF" opacity="0.9" />
      <circle cx="70" cy="116" r="2.5" fill="#FEF3C7" opacity="0.9" />
    </svg>
  );
};
