import React from 'react';

export interface Requisition3DIconProps {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const Requisition3DIcon: React.FC<Requisition3DIconProps> = ({
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
        filter: 'drop-shadow(0 8px 16px rgba(16, 185, 129, 0.28))',
        ...style
      }}
    >
      <defs>
        {/* Soft Ambient Ground Shadow */}
        <radialGradient id="req3d-ground-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#064e3b" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#064e3b" stopOpacity="0" />
        </radialGradient>

        {/* Board Base Shading */}
        <linearGradient id="req3d-board-side" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>

        {/* Board Front */}
        <linearGradient id="req3d-board-front" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="60%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Paper Sheet */}
        <linearGradient id="req3d-paper" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="80%" stopColor="#f0fdf4" />
          <stop offset="100%" stopColor="#dcfce7" />
        </linearGradient>

        {/* Metallic Clip */}
        <linearGradient id="req3d-clip" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>

        {/* Checkmark Accent Badge */}
        <linearGradient id="req3d-badge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* 1. Ground Shadow */}
      <ellipse cx="32" cy="58" rx="22" ry="5" fill="url(#req3d-ground-shadow)" />

      {/* 2. Clipboard Back Depth */}
      <rect x="14" y="15" width="36" height="42" rx="6" fill="url(#req3d-board-side)" transform="translate(1, 2)" />

      {/* 3. Clipboard Front Face */}
      <rect x="14" y="15" width="36" height="42" rx="6" fill="url(#req3d-board-front)" />

      {/* 4. White Paper Sheet */}
      <rect x="17" y="19" width="30" height="34" rx="4" fill="url(#req3d-paper)" />

      {/* Paper Check Rows & Lines */}
      {/* Row 1 */}
      <rect x="21" y="27" width="5" height="5" rx="1.5" fill="#a7f3d0" />
      <path d="M22 29.5 L23.5 31 L25.5 28" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="29" y="28.5" width="14" height="2" rx="1" fill="#6ee7b7" />

      {/* Row 2 */}
      <rect x="21" y="35" width="5" height="5" rx="1.5" fill="#a7f3d0" />
      <path d="M22 37.5 L23.5 39 L25.5 36" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="29" y="36.5" width="11" height="2" rx="1" fill="#6ee7b7" />

      {/* Row 3 */}
      <rect x="21" y="43" width="5" height="5" rx="1.5" fill="#d1fae5" />
      <rect x="29" y="44.5" width="15" height="2" rx="1" fill="#a7f3d0" />

      {/* 5. 3D Metallic Clip Top */}
      <rect x="24" y="11" width="16" height="9" rx="3" fill="url(#req3d-clip)" />
      {/* Clip Eyelet */}
      <rect x="28" y="7" width="8" height="6" rx="3" stroke="url(#req3d-clip)" strokeWidth="2" fill="none" />
      <circle cx="32" cy="15.5" r="2" fill="#475569" />

      {/* 6. Floating Green Approval Check Badge */}
      <g transform="translate(40, 39)">
        <circle cx="9" cy="9" r="9" fill="url(#req3d-badge)" filter="drop-shadow(0 4px 6px rgba(5, 150, 105, 0.4))" />
        <circle cx="9" cy="9" r="8" stroke="#a7f3d0" strokeWidth="0.8" fill="none" />
        <path d="M5.5 9 L7.8 11.5 L12.5 6.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
};
