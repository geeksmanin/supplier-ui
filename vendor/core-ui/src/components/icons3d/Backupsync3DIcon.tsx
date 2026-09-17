import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Backupsync3DIcon: React.FC<Icon3DProps> = ({
  width = '100%',
  height = '100%',
  size,
  style,
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
        {/* Ground Purple Glow */}
        <radialGradient id="bkBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.65" />
          <stop offset="60%" stopColor="#6366F1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
        </radialGradient>

        {/* Lower Disc Side Extrusion */}
        <linearGradient id="bkLowerCylinder" x1="22" y1="84" x2="118" y2="118" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4C1D95" />
          <stop offset="35%" stopColor="#3B0764" />
          <stop offset="70%" stopColor="#2E1065" />
          <stop offset="100%" stopColor="#17042B" />
        </linearGradient>

        {/* Lower Disc Top Face */}
        <linearGradient id="bkLowerFace" x1="24" y1="78" x2="116" y2="102" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7E22CE" />
          <stop offset="50%" stopColor="#581C87" />
          <stop offset="100%" stopColor="#3B0764" />
        </linearGradient>

        {/* Upper Disc Side Extrusion */}
        <linearGradient id="bkUpperCylinder" x1="22" y1="50" x2="118" y2="84" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6D28D9" />
          <stop offset="35%" stopColor="#581C87" />
          <stop offset="70%" stopColor="#3B0764" />
          <stop offset="100%" stopColor="#1E1035" />
        </linearGradient>

        {/* Upper Disc Top Face - Radiant Violet Platter */}
        <linearGradient id="bkUpperFace" x1="26" y1="36" x2="114" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D8B4FE" />
          <stop offset="25%" stopColor="#C084FC" />
          <stop offset="65%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#6B21A8" />
        </linearGradient>

        {/* Metallic Rim Bevel Light */}
        <linearGradient id="bkRimLight" x1="24" y1="38" x2="116" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#E9D5FF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7E22CE" stopOpacity="0.1" />
        </linearGradient>

        {/* Specular Highlight Curve */}
        <linearGradient id="bkPlatterHighlight" x1="38" y1="40" x2="102" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Backup Central Vault Core */}
        <radialGradient id="bkCoreDial" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#2E1065" stopOpacity="0.6" />
          <stop offset="60%" stopColor="#18022B" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#0B0114" stopOpacity="0.98" />
        </radialGradient>

        {/* 3D Sync Ring Arrow 1 (Neon Pink/Magenta) */}
        <linearGradient id="bkArrowPink" x1="45" y1="42" x2="95" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>

        {/* 3D Sync Ring Arrow 2 (Neon Emerald/Mint - Backup Verified) */}
        <linearGradient id="bkArrowEmerald" x1="95" y1="88" x2="45" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* Drop Shadow Filter */}
        <filter id="bkShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#18022B" floodOpacity="0.6" />
        </filter>
        <filter id="bkRingGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3.5" floodColor="#EC4899" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Ground Glow & Contact Shadows */}
      <ellipse cx="70" cy="136" rx="48" ry="11.5" fill="url(#bkBaseGlow)" />
      <ellipse cx="70" cy="133" rx="38" ry="7" fill="#18022B" opacity="0.5" />

      {/* === TIER 2: LOWER STORAGE DISC === */}
      <g filter="url(#bkShadow)">
        {/* Lower Cylinder Wall */}
        <path
          d="M24 90 C24 90 24 108 24 108 C24 118 44.6 124 70 124 C95.4 124 116 118 116 108 C116 108 116 90 116 90 Z"
          fill="url(#bkLowerCylinder)"
        />
        {/* Lower Cylinder Front Seam / Bevel */}
        <path
          d="M24 108 C24 118 44.6 124 70 124 C95.4 124 116 118 116 108"
          stroke="#3B0764"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Lower Disc Top Platter Surface */}
        <ellipse cx="70" cy="90" rx="46" ry="15" fill="url(#bkLowerFace)" stroke="#9333EA" strokeWidth="1.2" strokeOpacity="0.5" />

        {/* Lower Tier Drive Status LEDs (Green, Cyan, Amber Activity) */}
        <circle cx="48" cy="110" r="2.8" fill="#10B981" />
        <circle cx="58" cy="111.5" r="2.8" fill="#06B6D4" />
        <circle cx="68" cy="112" r="2.8" fill="#F59E0B" />

        {/* Storage Drive Ventilation Grille Slits */}
        <line x1="84" y1="108" x2="104" y2="105" stroke="#18022B" strokeWidth="2" strokeLinecap="round" />
        <line x1="84" y1="112" x2="104" y2="109" stroke="#18022B" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* === TIER 1: UPPER STORAGE DISC === */}
      <g filter="url(#bkShadow)">
        {/* Upper Cylinder Wall */}
        <path
          d="M24 54 C24 54 24 74 24 74 C24 84 44.6 92 70 92 C95.4 92 116 84 116 74 C116 74 116 54 116 54 Z"
          fill="url(#bkUpperCylinder)"
        />
        {/* Upper Cylinder Front Seam */}
        <path
          d="M24 74 C24 84 44.6 92 70 92 C95.4 92 116 84 116 74"
          stroke="#4C1D95"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Upper Disc Top Platter Surface */}
        <ellipse cx="70" cy="54" rx="46" ry="16" fill="url(#bkUpperFace)" stroke="url(#bkRimLight)" strokeWidth="2.2" />

        {/* Platter Specular Sheen Arc */}
        <path
          d="M34 50 C44 42 56 39 70 39 C84 39 96 42 106 50 C94 45 82 43 70 43 C58 43 46 45 34 50 Z"
          fill="url(#bkPlatterHighlight)"
        />

        {/* Concentric Track Groove Lines (Precision HDD / Storage Disk effect) */}
        <ellipse cx="70" cy="54" rx="38" ry="13" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.25" fill="none" />
        <ellipse cx="70" cy="54" rx="28" ry="9.5" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.2" fill="none" />
      </g>

      {/* === CENTRAL BACKUP SYNCHRONIZATION CORE === */}
      {/* 3D Holographic Vault Center Lens */}
      <g filter="drop-shadow(0 6px 12px rgba(24,2,43,0.7))">
        <ellipse cx="70" cy="62" rx="28" ry="16" fill="url(#bkCoreDial)" stroke="#C084FC" strokeWidth="2" strokeOpacity="0.8" />
        <ellipse cx="70" cy="62" rx="24" ry="13.5" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.2" fill="none" />
      </g>

      {/* Dual Sweeping 3D Backup Arrows */}
      <g filter="url(#bkRingGlow)">
        {/* Top-Right Clockwise Arrow */}
        <path
          d="M52 59 C55 52 64 48 74 48 C83 48 90 51 92 56"
          stroke="url(#bkArrowPink)"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
        <polygon points="92,48 100,57 88,62" fill="#FFFFFF" />

        {/* Bottom-Left Counter-Clockwise Arrow */}
        <path
          d="M88 65 C85 72 76 76 66 76 C57 76 50 73 48 68"
          stroke="url(#bkArrowEmerald)"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
        <polygon points="48,76 40,67 52,62" fill="#FFFFFF" />

        {/* Central Glowing Core Seed */}
        <circle cx="70" cy="62" r="4" fill="#FFFFFF" />
        <circle cx="70" cy="62" r="7.5" fill="#F472B6" opacity="0.4" />
      </g>

      {/* Backup Shield Accent / Top Badge */}
      <g filter="drop-shadow(0 4px 6px rgba(16,185,129,0.5))">
        <path
          d="M102 24 L114 28 C114 36 109 42 102 45 C95 42 90 36 90 28 Z"
          fill="#10B981"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />
        <path d="M96 32 L100 36 L108 28" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
};
