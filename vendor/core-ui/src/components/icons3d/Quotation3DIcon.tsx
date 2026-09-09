import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Quotation3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Document Front Violet/Indigo Gradient */}
        <linearGradient id="qtn3dDocGrad" x1="28" y1="18" x2="112" y2="132" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="25%" stopColor="#A855F7" />
          <stop offset="70%" stopColor="#7E22CE" />
          <stop offset="100%" stopColor="#581C87" />
        </linearGradient>

        {/* 3D Stack Page 2 (Mid Depth) */}
        <linearGradient id="qtn3dPage2Grad" x1="24" y1="24" x2="116" y2="136" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7E22CE" />
          <stop offset="100%" stopColor="#3B0764" />
        </linearGradient>

        {/* 3D Stack Page 3 (Back Depth) */}
        <linearGradient id="qtn3dPage3Grad" x1="20" y1="30" x2="120" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#581C87" />
          <stop offset="100%" stopColor="#1E0538" />
        </linearGradient>

        {/* 3D Corner Curl Underside */}
        <linearGradient id="qtn3dCurlGrad" x1="84" y1="18" x2="112" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#F3E8FF" />
          <stop offset="100%" stopColor="#D8B4FE" />
        </linearGradient>

        {/* Gold Seal & Ribbon Gradient */}
        <linearGradient id="qtn3dGoldGrad" x1="80" y1="80" x2="120" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="35%" stopColor="#FBBF24" />
          <stop offset="75%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Ribbon Tail Gradient */}
        <linearGradient id="qtn3dRibbonGrad" x1="88" y1="105" x2="108" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>

        {/* Specular Front Sheet Flare */}
        <linearGradient id="qtn3dHighlight" x1="32" y1="20" x2="88" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Chart Column 1 Gradient */}
        <linearGradient id="qtn3dBar1" x1="42" y1="96" x2="54" y2="114" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="100%" stopColor="#0891B2" />
        </linearGradient>

        {/* Chart Column 2 Gradient */}
        <linearGradient id="qtn3dBar2" x1="58" y1="88" x2="70" y2="114" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Chart Column 3 Gradient */}
        <linearGradient id="qtn3dBar3" x1="74" y1="80" x2="86" y2="114" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        {/* Base Ambient Glow */}
        <radialGradient id="qtn3dBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.65" />
          <stop offset="50%" stopColor="#7E22CE" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3B0764" stopOpacity="0" />
        </radialGradient>

        {/* Soft Drop Shadow Filter */}
        <filter id="qtn3dShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#2E0854" floodOpacity="0.55" />
        </filter>
        <filter id="qtn3dSealShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#451A03" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Ambient Ground Glow */}
      <ellipse cx="70" cy="132" rx="46" ry="12" fill="url(#qtn3dBaseGlow)" />
      <ellipse cx="70" cy="130" rx="32" ry="7" fill="#A855F7" opacity="0.35" />

      {/* 3D Stack Page 3 (Deepest Offset) */}
      <rect x="36" y="28" width="76" height="102" rx="14" fill="url(#qtn3dPage3Grad)" />

      {/* 3D Stack Page 2 (Mid Offset) */}
      <rect x="32" y="24" width="76" height="102" rx="14" fill="url(#qtn3dPage2Grad)" opacity="0.9" />

      {/* Main Front Document Sheet */}
      <g filter="url(#qtn3dShadow)">
        <path
          d="M28 32 C28 23.16 35.16 16 44 16 L86 16 L112 42 L112 116 C112 124.84 104.84 132 96 132 L44 132 C35.16 132 28 124.84 28 116 Z"
          fill="url(#qtn3dDocGrad)"
        />
      </g>

      {/* Glossy Front Specular Flare */}
      <path
        d="M30 32 C30 24 36 18 44 18 L84 18 L40 86 L30 86 Z"
        fill="url(#qtn3dHighlight)"
      />

      {/* Crisp White Top Bevel Rim */}
      <path
        d="M44 16 L86 16"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeOpacity="0.8"
        strokeLinecap="round"
      />
      <path
        d="M28 32 L28 116"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />

      {/* 3D Folded Top-Right Corner with Cast Shadow */}
      <path
        d="M86 16 L86 38 C86 40.2 87.8 42 90 42 L112 42 Z"
        fill="#3B0764"
        opacity="0.4"
      />
      <path
        d="M86 16 L86 38 C86 40.2 87.8 42 90 42 L112 42 Z"
        fill="url(#qtn3dCurlGrad)"
      />
      {/* Curl Fold Line Highlight */}
      <line x1="86" y1="16" x2="112" y2="42" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.9" />

      {/* Floating 3D Quotation Marks Glass Badge */}
      <g>
        <circle cx="48" cy="40" r="14" fill="#3B0764" opacity="0.6" />
        <circle cx="48" cy="38" r="13" fill="#581C87" />
        <circle cx="48" cy="38" r="12" fill="url(#qtn3dDocGrad)" />
        <circle cx="48" cy="38" r="11" stroke="#E9D5FF" strokeWidth="1" strokeOpacity="0.6" fill="none" />
        <text x="48" y="45" fill="#FFFFFF" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="Georgia, serif">“</text>
        <ellipse cx="44" cy="32" rx="4" ry="2" fill="#FFFFFF" opacity="0.8" />
      </g>

      {/* Document Line Placeholders */}
      <rect x="66" y="34" width="34" height="5" rx="2.5" fill="#FFFFFF" opacity="0.95" />
      <rect x="66" y="43" width="22" height="3.5" rx="1.75" fill="#F3E8FF" opacity="0.7" />

      <rect x="38" y="60" width="64" height="4" rx="2" fill="#F3E8FF" opacity="0.8" />
      <rect x="38" y="68" width="54" height="4" rx="2" fill="#F3E8FF" opacity="0.8" />
      <rect x="38" y="76" width="38" height="4" rx="2" fill="#F3E8FF" opacity="0.8" />

      {/* 3D Prism Estimation Bar Chart */}
      <g>
        {/* Bar 1 */}
        <rect x="42" y="96" width="11" height="18" rx="3" fill="url(#qtn3dBar1)" />
        <ellipse cx="47.5" cy="96" rx="5.5" ry="2" fill="#A5F3FC" />
        {/* Bar 2 */}
        <rect x="57" y="88" width="11" height="26" rx="3" fill="url(#qtn3dBar2)" />
        <ellipse cx="62.5" cy="88" rx="5.5" ry="2" fill="#BAE6FD" />
        {/* Bar 3 */}
        <rect x="72" y="80" width="11" height="34" rx="3" fill="url(#qtn3dBar3)" />
        <ellipse cx="77.5" cy="80" rx="5.5" ry="2" fill="#FEF08A" />
      </g>

      {/* Floating 3D Golden Approval Wax Seal & Ribbon */}
      <g filter="url(#qtn3dSealShadow)">
        {/* Ribbon Tails */}
        <path d="M96 116 L92 134 L98 130 L104 134 L100 116 Z" fill="url(#qtn3dRibbonGrad)" />
        <path d="M102 116 L108 132 L114 128 L118 132 L112 116 Z" fill="#B91C1C" />

        {/* Seal Outer Rim */}
        <circle cx="100" cy="104" r="16" fill="#78350F" />
        <circle cx="99" cy="103" r="15" fill="url(#qtn3dGoldGrad)" />
        {/* Seal Inner Bevel Ring */}
        <circle cx="99" cy="103" r="12" stroke="#FEF08A" strokeWidth="1.5" fill="none" />
        {/* Checkmark Stamp */}
        <path
          d="M93 103 L97 107 L105 98"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Specular Glint */}
        <ellipse cx="95" cy="96" rx="4" ry="2" fill="#FFFFFF" opacity="0.8" />
      </g>
    </svg>
  );
};
