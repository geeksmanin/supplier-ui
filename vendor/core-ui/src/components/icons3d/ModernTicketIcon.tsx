import React from 'react';

export interface ModernTicketIconProps {
  width?: string | number;
  height?: string | number;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const ModernTicketIcon: React.FC<ModernTicketIconProps> = ({
  width = '100%',
  height = '100%',
  size,
  className,
  style,
}) => {
  const w = size ?? width;
  const h = size ?? height;

  return (
    <svg
      data-testid="modern-ticket-icon"
      width={w}
      height={h}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id="modTicketGrad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00A884" />
          <stop offset="100%" stopColor="#008069" />
        </linearGradient>
        <filter id="modTicketShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#00382E" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Modern Ticket Silhouette with Perforated Side Notches */}
      <path
        d="M 8 10 C 8 7.8 9.8 6 12 6 L 36 6 C 38.2 6 40 7.8 40 10 L 40 20 C 37.8 20 36 21.8 36 24 C 36 26.2 37.8 28 40 28 L 40 38 C 40 40.2 38.2 42 36 42 L 12 42 C 9.8 42 8 40.2 8 38 L 8 28 C 10.2 28 12 26.2 12 24 C 12 21.8 10.2 20 8 20 Z"
        fill="url(#modTicketGrad)"
        filter="url(#modTicketShadow)"
      />

      {/* Subtle Inner Border Inset */}
      <path
        d="M 12 7.5 L 36 7.5 C 37.4 7.5 38.5 8.6 38.5 10 L 38.5 18 C 36.5 19 34.5 21 34.5 24 C 34.5 27 36.5 29 38.5 30 L 38.5 38 C 38.5 39.4 37.4 40.5 36 40.5 L 12 40.5 C 10.6 40.5 9.5 39.4 9.5 38 L 9.5 30 C 11.5 29 13.5 27 13.5 24 C 13.5 21 11.5 19 9.5 18 L 9.5 10 C 9.5 8.6 10.6 7.5 12 7.5 Z"
        stroke="rgba(255, 255, 255, 0.28)"
        strokeWidth="1"
        fill="none"
      />

      {/* Perforated Center Fold Line */}
      <line
        x1="12"
        y1="24"
        x2="36"
        y2="24"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeDasharray="2.5 2.5"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* Upper Stub: Modern Support Lifebuoy Core */}
      <circle cx="24" cy="15" r="4.5" stroke="#ffffff" strokeWidth="1.8" fill="none" opacity="0.95" />
      <circle cx="24" cy="15" r="2" fill="#ffffff" opacity="0.95" />

      {/* Lower Stub: Crisp Clean Barcode Accent */}
      <line x1="16" y1="31" x2="16" y2="36" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
      <line x1="20" y1="31" x2="20" y2="36" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.75" />
      <line x1="23" y1="31" x2="23" y2="36" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
      <line x1="27" y1="31" x2="27" y2="36" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
      <line x1="31" y1="31" x2="31" y2="36" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
};
