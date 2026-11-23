import React from 'react';
import { Category3DIconProps } from './TicketCategoryIcons.types';

/**
 * 5. 3D Technical Help & Engineering Icon (🛠️)
 * Precision 3D Titanium Shield with Chrome Wrench & Cyan LED Core.
 */
export const TechSupport3DIcon: React.FC<Category3DIconProps> = ({
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
        <radialGradient id="tchDrop" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0F172A" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tchShield" x1="14" y1="12" x2="50" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="45%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="tchChrome" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#E2E8F0" />
          <stop offset="75%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <filter id="tchGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0F172A" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="32" cy="57" rx="20" ry="4.5" fill="url(#tchDrop)" />

      {/* 3D Titanium Shield Base */}
      <path
        d="M 32 12 L 49 18 C 49 33, 41 46, 32 52 C 23 46, 15 33, 15 18 Z"
        fill="#0F172A"
      />
      <path
        d="M 32 10 L 49 16 C 49 31, 41 44, 32 50 C 23 44, 15 31, 15 16 Z"
        fill="url(#tchShield)"
        stroke="#94A3B8"
        strokeWidth="1.2"
        filter="url(#tchGlow)"
      />

      {/* Shield Inner Bevel Inset */}
      <path
        d="M 32 14 L 45 19 C 45 30, 39 40, 32 45 C 25 40, 19 30, 19 19 Z"
        stroke="#334155"
        strokeWidth="1"
        fill="none"
      />

      {/* Crossed Chrome Screwdriver */}
      <line x1="22" y1="40" x2="42" y2="20" stroke="url(#tchChrome)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="22" cy="40" r="3" fill="#E2E8F0" stroke="#475569" strokeWidth="0.8" />

      {/* Crossed Chrome Wrench */}
      <line x1="42" y1="40" x2="22" y2="20" stroke="url(#tchChrome)" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="42" cy="40" r="3" fill="#E2E8F0" stroke="#475569" strokeWidth="0.8" />

      {/* Wrench Jaw (Top Left) */}
      <path
        d="M 18 17 L 23 22 L 20 25 L 15 20 Z"
        fill="#FFFFFF"
        stroke="#64748B"
        strokeWidth="0.8"
      />

      {/* Glowing Cyan LED Status Indicator */}
      <circle cx="32" cy="30" r="4" fill="#0891B2" stroke="#FFFFFF" strokeWidth="1" />
      <circle cx="32" cy="30" r="2.2" fill="#38BDF8" />
    </svg>
  );
};
