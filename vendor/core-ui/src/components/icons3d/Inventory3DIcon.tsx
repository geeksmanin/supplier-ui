import React from 'react';
import { Icon3DProps } from './Location3DIcon';

/**
 * Warehouse & Inventory Logo — Isometric 3D Smart Warehouse + Inventory Stack + Barcode Scanner Badge.
 */
export const Inventory3DIcon: React.FC<Icon3DProps> = ({
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
        <linearGradient id="whRoofMain" x1="20" y1="20" x2="115" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2DD4BF" />
          <stop offset="55%" stopColor="#0D9488" />
          <stop offset="100%" stopColor="#0F766E" />
        </linearGradient>
        <linearGradient id="whRoofRight" x1="70" y1="24" x2="120" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F766E" />
          <stop offset="100%" stopColor="#115E59" />
        </linearGradient>
        <linearGradient id="whWallLeft" x1="22" y1="54" x2="70" y2="128" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0E7490" />
          <stop offset="100%" stopColor="#164E63" />
        </linearGradient>
        <linearGradient id="whWallRight" x1="70" y1="54" x2="118" y2="128" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#155E75" />
          <stop offset="100%" stopColor="#083344" />
        </linearGradient>
        <linearGradient id="whCrateTop" x1="36" y1="74" x2="66" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="whCrateSide" x1="36" y1="88" x2="64" y2="124" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <radialGradient id="whBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.48" />
          <stop offset="70%" stopColor="#0E7490" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#083344" stopOpacity="0" />
        </radialGradient>
        <filter id="whShadow" x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="0" dy="9" stdDeviation="7" floodColor="#0F172A" floodOpacity="0.38" />
        </filter>
      </defs>

      <ellipse cx="70" cy="132" rx="46" ry="12" fill="url(#whBaseGlow)" />

      {/* Main Isometric Smart Warehouse Shell */}
      <g filter="url(#whShadow)">
        <path d="M24 58 L70 84 L70 128 L24 102 Z" fill="url(#whWallLeft)" />
        <path d="M70 84 L116 58 L116 102 L70 128 Z" fill="url(#whWallRight)" />
        <path d="M18 56 L70 26 L70 52 L18 80 Z" fill="url(#whRoofMain)" />
        <path d="M70 26 L122 56 L122 80 L70 52 Z" fill="url(#whRoofRight)" />
      </g>

      {/* Ridge Specular Highlight */}
      <line x1="70" y1="26" x2="70" y2="52" stroke="#CCFBF1" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.85" />
      <line x1="20" y1="56" x2="70" y2="26" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.55" />

      {/* Stacked Inventory Crates in Open Loading Bay (Left Wall) */}
      <polygon points="34,76 62,90 62,124 34,110" fill="#0F172A" opacity="0.55" />
      <polygon points="38,90 50,84 60,90 48,96" fill="url(#whCrateTop)" />
      <polygon points="38,90 48,96 48,116 38,110" fill="#F59E0B" />
      <polygon points="48,96 60,90 60,110 48,116" fill="url(#whCrateSide)" />

      {/* Rack Windows + Serial Barcode Badge (Right Wall) */}
      <polygon points="79,76 92,69 92,82 79,89" fill="#5EEAD4" opacity="0.88" />
      <polygon points="97,66 110,59 110,72 97,79" fill="#5EEAD4" opacity="0.88" />

      {/* Floating Serial Verification Pill */}
      <g transform="translate(82, 86)">
        <rect x="0" y="0" width="36" height="24" rx="6" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2" />
        <line x1="7" y1="6" x2="7" y2="18" stroke="#0F172A" strokeWidth="2" />
        <line x1="12" y1="6" x2="12" y2="15" stroke="#0F172A" strokeWidth="1.5" />
        <line x1="16" y1="6" x2="16" y2="18" stroke="#0D9488" strokeWidth="2.5" />
        <line x1="22" y1="6" x2="22" y2="15" stroke="#0F172A" strokeWidth="1.5" />
        <line x1="27" y1="6" x2="27" y2="18" stroke="#0F172A" strokeWidth="2" />
      </g>
    </svg>
  );
};
