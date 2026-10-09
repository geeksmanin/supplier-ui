import React, { useState } from 'react';

export interface Samwad3DIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Samwad3DIcon: React.FC<Samwad3DIconProps> = ({
  size = 48,
  className,
  style,
}) => {
  const [loadError, setLoadError] = useState(false);

  if (loadError) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        width={size}
        height={size}
        className={className}
        style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      >
        <defs>
          <linearGradient id="samwadBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D2137" />
            <stop offset="45%" stopColor="#065947" />
            <stop offset="100%" stopColor="#00A884" />
          </linearGradient>
          <linearGradient id="samwadBubbleMainGrad" x1="10%" y1="5%" x2="90%" y2="95%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>
          <linearGradient id="samwadBubbleAccentGrad" x1="10%" y1="10%" x2="90%" y2="90%">
            <stop offset="0%" stopColor="#ECFDF5" />
            <stop offset="60%" stopColor="#A7F3D0" />
            <stop offset="100%" stopColor="#6EE7B7" />
          </linearGradient>
        </defs>
        <rect width="440" height="440" x="36" y="36" rx="96" fill="url(#samwadBgGrad)" />
        <path
          d="M136 148 C136 148 376 148 376 148 C420 148 456 184 456 228 C456 272 420 308 376 308 L280 308 L208 368 L222 308 L136 308 C92 308 56 272 56 228 C56 184 92 148 136 148 Z"
          fill="url(#samwadBubbleMainGrad)"
        />
        <circle cx="176" cy="228" r="20" fill="#FFFFFF" />
        <circle cx="240" cy="228" r="20" fill="#FFFFFF" />
        <circle cx="304" cy="228" r="20" fill="#FFFFFF" />
        <path
          d="M268 252 C268 252 408 252 408 252 C444 252 472 280 472 316 C472 352 444 380 408 380 L376 380 L348 424 L340 380 L268 380 C232 380 204 352 204 316 C204 280 232 252 268 252 Z"
          fill="url(#samwadBubbleAccentGrad)"
        />
        <circle cx="304" cy="316" r="16" fill="#065947" />
        <circle cx="364" cy="316" r="16" fill="#065947" />
      </svg>
    );
  }

  return (
    <img
      src="/samwad-icon-3d.png"
      alt="Samwad Communication"
      width={size}
      height={size}
      className={className}
      onError={() => setLoadError(true)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-block',
        verticalAlign: 'middle',
        borderRadius: `${Math.max(6, Math.round(size * 0.22))}px`,
        objectFit: 'contain',
        flexShrink: 0,
        boxShadow: '0 4px 14px rgba(0, 128, 105, 0.28)',
        ...style,
      }}
    />
  );
};
