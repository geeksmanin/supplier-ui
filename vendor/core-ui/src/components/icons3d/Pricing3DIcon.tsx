import React from 'react';

export interface Pricing3DIconProps {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const Pricing3DIcon: React.FC<Pricing3DIconProps> = ({
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
        filter: 'drop-shadow(0 8px 16px rgba(244, 63, 94, 0.28))',
        ...style
      }}
    >
      <defs>
        {/* Soft Ambient Ground Shadow */}
        <radialGradient id="p3d-ground-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#881337" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#881337" stopOpacity="0" />
        </radialGradient>

        {/* Tag Body 3D Base Shading */}
        <linearGradient id="p3d-tag-side" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#be123c" />
          <stop offset="100%" stopColor="#4c0519" />
        </linearGradient>

        {/* Tag Front Face */}
        <linearGradient id="p3d-tag-front" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="40%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>

        {/* Specular Glint Reflection */}
        <linearGradient id="p3d-tag-specular" x1="0%" y1="0%" x2="100%" y2="80%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Eyelet Metallic Ring */}
        <linearGradient id="p3d-eyelet" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>

        {/* String Loop */}
        <linearGradient id="p3d-string" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fecdd3" />
          <stop offset="100%" stopColor="#fda4af" />
        </linearGradient>
      </defs>

      {/* 1. Ground Shadow */}
      <ellipse cx="33" cy="57" rx="19" ry="5" fill="url(#p3d-ground-shadow)" />

      {/* 2. String Cord Loop */}
      <path
        d="M23 15 C 20 6, 12 8, 14 16 C 15 20, 20 20, 22 17"
        stroke="url(#p3d-string)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* 3. 3D Tag Thickness (Extruded Depth Back/Side) */}
      <path
        d="M26 12 L47 33 C49 35, 49 39, 47 41 L37 51 C35 53, 31 53, 29 51 L8 30 C7 29, 6.5 27.5, 6.5 26 L6.5 15 C6.5 13.5, 7.5 12.5, 9 12.5 Z"
        fill="url(#p3d-tag-side)"
        transform="translate(2, 3)"
      />

      {/* 4. Tag Front Face */}
      <path
        d="M26 12 L47 33 C49 35, 49 39, 47 41 L37 51 C35 53, 31 53, 29 51 L8 30 C7 29, 6.5 27.5, 6.5 26 L6.5 15 C6.5 13.5, 7.5 12.5, 9 12.5 Z"
        fill="url(#p3d-tag-front)"
      />

      {/* 5. Glassy Specular Highlight Slice */}
      <path
        d="M26 12 L38 24 L21 41 L8 28 L8 15 C8 13.5, 8.5 12.5, 10 12.5 Z"
        fill="url(#p3d-tag-specular)"
      />

      {/* 6. Eyelet Metallic Hole */}
      <circle cx="16" cy="21" r="5" fill="url(#p3d-eyelet)" />
      <circle cx="16" cy="21" r="3" fill="#881337" />
      <circle cx="15.2" cy="20.2" r="2.2" fill="#4c0519" />

      {/* 7. Subtle 3D Beveled Percentage / Price Symbol */}
      <g transform="translate(24, 27) rotate(-45)" opacity="0.9">
        {/* Top small circle */}
        <circle cx="5" cy="4" r="2.5" fill="#ffffff" fillOpacity="0.85" />
        <circle cx="5" cy="4" r="1.2" fill="#e11d48" />
        {/* Diagonal division line */}
        <line x1="2" y1="14" x2="16" y2="2" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.9" />
        {/* Bottom small circle */}
        <circle cx="13" cy="12" r="2.5" fill="#ffffff" fillOpacity="0.85" />
        <circle cx="13" cy="12" r="1.2" fill="#e11d48" />
      </g>

      {/* 8. Top Edge Gleam */}
      <path
        d="M9 12.5 L26 12 L46 32"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.6"
        fill="none"
      />
    </svg>
  );
};
