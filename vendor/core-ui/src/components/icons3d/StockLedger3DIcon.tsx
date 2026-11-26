import React from 'react';
import { Icon3DProps } from './Location3DIcon';

/**
 * Stock Ledger Logo — Isometric 3D Perpetual Double-Entry Ledger Book + Debit/Credit Columns + Verification Seal.
 * Intentionally distinct from warehouse building icons (WMS3DIcon / Inventory3DIcon).
 */
export const StockLedger3DIcon: React.FC<Icon3DProps> = ({
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
        <linearGradient id="slCoverGrad" x1="24" y1="18" x2="108" y2="118" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="50%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>
        <linearGradient id="slSpineGrad" x1="20" y1="26" x2="40" y2="128" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3730A3" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
        <linearGradient id="slPageGrad" x1="42" y1="30" x2="104" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
        <linearGradient id="slBadgeGrad" x1="78" y1="78" x2="124" y2="124" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <radialGradient id="slBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.45" />
          <stop offset="70%" stopColor="#4F46E5" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
        </radialGradient>
        <filter id="slShadow" x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="0" dy="9" stdDeviation="7" floodColor="#1E1B4B" floodOpacity="0.36" />
        </filter>
      </defs>

      {/* Ambient Base Glow */}
      <ellipse cx="68" cy="132" rx="44" ry="11" fill="url(#slBaseGlow)" />

      {/* 3D Bound Stock Ledger Cover & Spine */}
      <g filter="url(#slShadow)">
        {/* Thick Ledger Spine */}
        <path d="M24 30 C24 24, 32 20, 38 20 L38 118 C32 118, 24 122, 24 128 Z" fill="url(#slSpineGrad)" />
        {/* Stacked Page Edges */}
        <path d="M36 116 L108 116 L108 128 L34 128 C28 128, 24 124, 24 118 Z" fill="#E2E8F0" />
        <line x1="36" y1="121" x2="104" y2="121" stroke="#CBD5E1" strokeWidth="1.5" />
        {/* Front Hardcover Board */}
        <rect x="34" y="20" width="76" height="98" rx="10" fill="url(#slCoverGrad)" />
      </g>

      {/* Binding Rings Along Spine */}
      <rect x="20" y="38" width="12" height="6" rx="3" fill="#C7D2FE" />
      <rect x="20" y="64" width="12" height="6" rx="3" fill="#C7D2FE" />
      <rect x="20" y="90" width="12" height="6" rx="3" fill="#C7D2FE" />

      {/* Crisp Inset Double-Entry Sheet */}
      <rect x="44" y="30" width="56" height="78" rx="6" fill="url(#slPageGrad)" />

      {/* Header Tab & Ledger Column Split */}
      <rect x="50" y="38" width="44" height="8" rx="3" fill="#E0E7FF" />
      <line x1="72" y1="50" x2="72" y2="100" stroke="#CBD5E1" strokeWidth="2" />

      {/* Debit (+) & Credit (-) Perpetual Movement Entries */}
      <line x1="50" y1="56" x2="66" y2="56" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="77" y1="56" x2="92" y2="56" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />

      <line x1="50" y1="68" x2="68" y2="68" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="77" y1="68" x2="88" y2="68" stroke="#94A3B8" strokeWidth="3.5" strokeLinecap="round" />

      <line x1="50" y1="80" x2="62" y2="80" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="77" y1="80" x2="94" y2="80" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />

      <line x1="50" y1="92" x2="67" y2="92" stroke="#4F46E5" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="77" y1="92" x2="90" y2="92" stroke="#4F46E5" strokeWidth="3.5" strokeLinecap="round" />

      {/* Floating Audit / Balance Verified Emblem */}
      <circle cx="101" cy="100" r="22" fill="url(#slBadgeGrad)" stroke="#FFFFFF" strokeWidth="3" />
      <path d="M92 100 L98 106 L111 93" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
