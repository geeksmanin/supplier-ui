import React from 'react';
import { Category3DIconProps } from './TicketCategoryIcons.types';

/**
 * 3. 3D Billing & Invoices Payment Icon (💳)
 * Emerald smart credit card with gold microchip, embossed chip bands & currency coin.
 */
export const BillingPayment3DIcon: React.FC<Category3DIconProps> = ({
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
        <radialGradient id="bilDrop" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#064E3B" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#064E3B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bilCard" x1="12" y1="18" x2="52" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="35%" stopColor="#10B981" />
          <stop offset="75%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="bilChip" x1="18" y1="28" x2="28" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="bilCoin" x1="40" y1="32" x2="56" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="40%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="32" cy="56" rx="22" ry="4.5" fill="url(#bilDrop)" />

      {/* 3D Card Body (Tilted Perspective) */}
      <rect x="10" y="18" width="44" height="28" rx="5" fill="#064E3B" />
      <rect x="10" y="16" width="44" height="28" rx="5" fill="url(#bilCard)" stroke="#6EE7B7" strokeWidth="0.8" />

      {/* Specular Highlight Streak */}
      <path d="M 12 17 C 24 17, 38 20, 52 24 L 46 29 C 32 25, 20 22, 12 22 Z" fill="#FFFFFF" opacity="0.3" />

      {/* Gold EMV Smart Chip */}
      <rect x="16" y="24" width="9" height="7" rx="1.5" fill="url(#bilChip)" stroke="#78350F" strokeWidth="0.6" />
      <line x1="16" y1="27.5" x2="25" y2="27.5" stroke="#78350F" strokeWidth="0.5" />
      <line x1="20.5" y1="24" x2="20.5" y2="31" stroke="#78350F" strokeWidth="0.5" />

      {/* Contactless Signal Waves */}
      <path d="M 28 25 C 29 26.5, 29 28.5, 28 30" stroke="#A7F3D0" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M 31 23.5 C 32.5 26, 32.5 29, 31 31.5" stroke="#A7F3D0" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* Card Embossed Number Dots */}
      <circle cx="17" cy="38" r="1.2" fill="#A7F3D0" />
      <circle cx="21" cy="38" r="1.2" fill="#A7F3D0" />
      <circle cx="25" cy="38" r="1.2" fill="#A7F3D0" />
      <circle cx="29" cy="38" r="1.2" fill="#A7F3D0" />

      {/* Overlapping Gold Coin / Currency Token */}
      <g>
        <circle cx="48" cy="40" r="9" fill="#78350F" />
        <circle cx="48" cy="39" r="9" fill="url(#bilCoin)" stroke="#FEF08A" strokeWidth="1" />
        <circle cx="48" cy="39" r="6.8" fill="none" stroke="#78350F" strokeWidth="0.7" opacity="0.6" />
        <text x="48" y="43" textAnchor="middle" fill="#78350F" fontSize="9.5" fontWeight="900" fontFamily="sans-serif">₹</text>
      </g>
    </svg>
  );
};
