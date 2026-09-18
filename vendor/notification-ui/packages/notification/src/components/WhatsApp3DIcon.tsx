import React from 'react';

interface WhatsApp3DIconProps {
  size?: number;
  className?: string;
}

export const WhatsApp3DIcon: React.FC<WhatsApp3DIconProps> = ({ size = 36, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0px 6px 12px rgba(18, 140, 126, 0.35))' }}
    >
      <defs>
        <linearGradient id="wa3d_bg" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#25D366" />
          <stop offset="50%" stopColor="#1ebd56" />
          <stop offset="100%" stopColor="#0e8346" />
        </linearGradient>
        <radialGradient id="wa3d_light" cx="32" cy="14" r="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wa3d_phone" x1="20" y1="20" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f0fdf4" />
        </linearGradient>
      </defs>

      {/* 3D Base Circle / Chat Tail */}
      <path
        d="M32 4C16.536 4 4 16.536 4 32c0 5.412 1.534 10.465 4.195 14.76L4.5 59.5l13.125-3.62C21.724 58.337 26.657 60 32 60c15.464 0 28-12.536 28-28S47.464 4 32 4z"
        fill="url(#wa3d_bg)"
      />
      {/* Top Specular Highlight */}
      <path
        d="M32 4C16.536 4 4 16.536 4 32c0 5.412 1.534 10.465 4.195 14.76L4.5 59.5l13.125-3.62C21.724 58.337 26.657 60 32 60c15.464 0 28-12.536 28-28S47.464 4 32 4z"
        fill="url(#wa3d_light)"
      />
      
      {/* 3D Phone Handle Icon */}
      <path
        d="M21.5 17.5c-.8-.8-1.7-1-2.5-1-.9 0-1.7.2-2.3.8-1 1-2.2 2.6-2.2 4.7 0 4.1 2.9 8.6 6.8 12.5 3.9 3.9 8.4 6.8 12.5 6.8 2.1 0 3.7-1.2 4.7-2.2.6-.6.8-1.4.8-2.3 0-.8-.2-1.7-1-2.5l-4-4c-.7-.7-1.6-.9-2.3-.4l-2 1.6c-.5.4-1.2.4-1.8.1-1.3-.6-3.2-1.8-4.7-3.3-1.5-1.5-2.7-3.4-3.3-4.7-.3-.6-.3-1.3.1-1.8l1.6-2c.5-.7.3-1.6-.4-2.3l-4-4z"
        fill="url(#wa3d_phone)"
        filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.25))"
      />
    </svg>
  );
};
