import React from 'react';

interface WhatsApp3DIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const WhatsApp3DIcon: React.FC<WhatsApp3DIconProps> = ({ size = 36, className, style }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        borderRadius: '10px',
        boxShadow: '0 2px 5px rgba(18, 140, 126, 0.25)',
        ...style,
      }}
    >
      <defs>
        <linearGradient id="wa_platform_grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#25D366" />
          <stop offset="100%" stopColor="#128C7E" />
        </linearGradient>
      </defs>
      {/* Sleek rounded squircle background matching platform aesthetic */}
      <rect width="48" height="48" rx="11" fill="url(#wa_platform_grad)" />
      
      {/* Subtle top inner reflection border */}
      <rect x="0.5" y="0.5" width="47" height="47" rx="10.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />

      {/* Crisp White Official WhatsApp Glyph */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 9.5C16.03 9.5 9.5 16.03 9.5 24C9.5 26.65 10.22 29.14 11.48 31.28L10 38.5L17.43 36.56C19.43 37.66 21.65 38.25 24 38.25C31.97 38.25 38.5 31.72 38.5 23.75C38.5 15.78 31.97 9.5 24 9.5ZM20.65 16.5C20.35 15.85 19.95 15.8 19.45 15.8C19.2 15.8 18.9 15.8 18.6 15.8C18.3 15.8 17.85 15.95 17.5 16.35C17.1 16.75 16 17.8 16 19.95C16 22.1 17.55 24.2 17.75 24.5C18 24.8 20.75 29.3 25.1 31C28.7 32.4 29.45 31.85 30.2 31.75C30.95 31.65 32.65 30.75 33 29.75C33.35 28.75 33.35 27.9 33.25 27.75C33.15 27.6 32.85 27.5 32.4 27.25C31.95 27 29.75 25.9 29.35 25.75C28.95 25.6 28.65 25.5 28.35 25.95C28.05 26.4 27.2 27.5 26.95 27.8C26.7 28.1 26.45 28.15 26 27.9C25.55 27.65 24.15 27.2 22.45 25.7C21.15 24.55 20.25 23.1 20 22.65C19.75 22.2 20 21.95 20.2 21.75C20.4 21.55 20.65 21.2 20.85 20.95C21.05 20.7 21.15 20.5 21.3 20.2C21.45 19.9 21.35 19.65 21.25 19.45C21.15 19.25 20.75 18.3 20.65 16.5Z"
        fill="white"
      />
    </svg>
  );
};
