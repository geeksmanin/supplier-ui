import React from 'react';
import { Category3DIconProps } from './TicketCategoryIcons.types';

/**
 * 1. 3D Order & Delivery Issue Icon (📦)
 * Isometric delivery carton with parcel tape, shipping label & barcode, and emerald check.
 */
export const OrderIssue3DIcon: React.FC<Category3DIconProps> = ({
  size = 20,
  style,
  className,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <defs>
        <radialGradient id="ordDrop" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#064E3B" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#064E3B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ordTop" x1="16" y1="12" x2="48" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="ordLeft" x1="10" y1="24" x2="32" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <linearGradient id="ordRight" x1="32" y1="24" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <linearGradient id="ordTape" x1="26" y1="14" x2="38" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="ordCheck" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="32" cy="58" rx="22" ry="4.5" fill="url(#ordDrop)" />

      {/* Left Face */}
      <path d="M10 24 L32 35 L32 54 L10 43 Z" fill="url(#ordLeft)" stroke="#78350F" strokeWidth="0.75" />

      {/* Right Face */}
      <path d="M32 35 L54 24 L54 43 L32 54 Z" fill="url(#ordRight)" stroke="#78350F" strokeWidth="0.75" />

      {/* Top Face */}
      <path d="M32 12 L54 24 L32 35 L10 24 Z" fill="url(#ordTop)" stroke="#B45309" strokeWidth="0.75" />

      {/* Tape Down the Middle */}
      <path d="M29 13.5 L35 17 L35 36.5 L29 33 Z" fill="url(#ordTape)" opacity="0.95" />
      <path d="M29 33 L35 36.5 L35 53.5 L29 50 Z" fill="url(#ordTape)" opacity="0.85" />

      {/* Shipping Label on Left Face */}
      <path d="M15 31 L24 35.5 L24 43 L15 38.5 Z" fill="#FFFFFF" opacity="0.92" />
      <line x1="17" y1="34" x2="22" y2="36.5" stroke="#475569" strokeWidth="1" strokeLinecap="round" />
      <line x1="17" y1="37" x2="22" y2="39.5" stroke="#475569" strokeWidth="1" strokeLinecap="round" />

      {/* Fast Delivery Mini Badge (Top Right) */}
      <circle cx="48" cy="18" r="7" fill="url(#ordCheck)" stroke="#FFFFFF" strokeWidth="1.5" />
      <path d="M44.5 18 L47 20.5 L51.5 15.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
};
