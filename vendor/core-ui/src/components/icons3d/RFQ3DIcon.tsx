import React from 'react';

export interface RFQ3DIconProps {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const RFQ3DIcon: React.FC<RFQ3DIconProps> = ({
  size = 56,
  width,
  height,
  className,
  style
}) => {
  const iconWidth = width || size;
  const iconHeight = height || size;

  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        maxWidth: '100%',
        maxHeight: '100%',
        overflow: 'visible',
        filter: 'drop-shadow(0 8px 16px rgba(139, 92, 246, 0.32))',
        ...style
      }}
    >
      <defs>
        {/* Soft Ambient Ground Shadow */}
        <radialGradient id="rfq3d-ground-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0" />
        </radialGradient>

        {/* Back Layer Document */}
        <linearGradient id="rfq3d-back-doc" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>

        {/* Front Layer Document */}
        <linearGradient id="rfq3d-front-doc" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f5f3ff" />
          <stop offset="100%" stopColor="#ede9fe" />
        </linearGradient>

        {/* Fold Corner */}
        <linearGradient id="rfq3d-fold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>

        {/* Floating Quote Badge */}
        <linearGradient id="rfq3d-quote-badge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7e22ce" />
        </linearGradient>
      </defs>

      {/* 1. Ground Shadow */}
      <ellipse cx="32" cy="58" rx="20" ry="5" fill="url(#rfq3d-ground-shadow)" />

      {/* 2. Secondary Tilted Back Document (Layering effect) */}
      <rect x="20" y="10" width="30" height="42" rx="4" fill="url(#rfq3d-back-doc)" opacity="0.6" transform="rotate(8 35 31)" />

      {/* 3. Primary Front RFQ Sheet */}
      <path
        d="M12 12 C12 9.8 13.8 8 16 8 L36 8 L46 18 L46 50 C46 52.2 44.2 54 42 54 L16 54 C13.8 54 12 52.2 12 50 Z"
        fill="url(#rfq3d-front-doc)"
      />

      {/* 4. Folded Top-Right Corner */}
      <path
        d="M36 8 L36 16 C36 17.1 36.9 18 38 18 L46 18 Z"
        fill="url(#rfq3d-fold)"
      />

      {/* 5. Document Header & Line Items */}
      <rect x="18" y="15" width="14" height="4" rx="2" fill="#8b5cf6" />
      <rect x="18" y="24" width="22" height="2.5" rx="1" fill="#c4b5fd" />
      <rect x="18" y="30" width="18" height="2.5" rx="1" fill="#ddd6fe" />
      <rect x="18" y="36" width="12" height="2.5" rx="1" fill="#ddd6fe" />

      {/* 6. Floating Bid & RFQ Speech Badge */}
      <g transform="translate(32, 33)">
        <path
          d="M0 6 C0 2.7 2.7 0 6 0 L20 0 C23.3 0 26 2.7 26 6 L26 18 C26 21.3 23.3 24 20 24 L8 24 L2 28 L3 24 L6 24 C2.7 24 0 21.3 0 18 Z"
          fill="url(#rfq3d-quote-badge)"
          filter="drop-shadow(0 4px 8px rgba(126, 34, 206, 0.4))"
        />
        {/* Quote Glyph Inside Badge */}
        <text x="6" y="17" fill="#ffffff" fontSize="16" fontWeight="bold" fontFamily="Georgia, serif">“</text>
        <text x="14" y="17" fill="#ffffff" fontSize="16" fontWeight="bold" fontFamily="Georgia, serif">”</text>
      </g>
    </svg>
  );
};
