import React, { useState } from 'react';

export interface SamwadMiniIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const SamwadMiniIcon: React.FC<SamwadMiniIconProps> = ({
  size = 20,
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
          <linearGradient id="samwadMiniBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#064E3B" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="samwadMiniBubbleGrad" x1="10%" y1="10%" x2="90%" y2="90%">
            <stop offset="0%" stopColor="#ECFDF5" />
            <stop offset="60%" stopColor="#A7F3D0" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>
        <path
          d="M126 138 C126 138 360 138 360 138 C403 138 436 171 436 214 C436 257 403 290 360 290 L264 290 L198 348 L210 290 L126 290 C83 290 50 257 50 214 C50 171 83 138 126 138 Z"
          fill="url(#samwadMiniBgGrad)"
        />
        <circle cx="166" cy="214" r="18" fill="#FFFFFF" />
        <circle cx="228" cy="214" r="18" fill="#FFFFFF" />
        <circle cx="290" cy="214" r="18" fill="#FFFFFF" />
        <path
          d="M258 236 C258 236 390 236 390 236 C424 236 452 264 452 298 C452 332 424 360 390 360 L360 360 L336 402 L328 360 L258 360 C224 360 196 332 196 298 C196 264 224 236 258 236 Z"
          fill="url(#samwadMiniBubbleGrad)"
        />
        <circle cx="292" cy="298" r="14" fill="#065947" />
        <circle cx="348" cy="298" r="14" fill="#065947" />
      </svg>
    );
  }

  return (
    <img
      src="/samwad-icon-3d.png"
      alt="Samwad"
      width={size}
      height={size}
      className={className}
      onError={() => setLoadError(true)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-block',
        verticalAlign: 'middle',
        borderRadius: `${Math.max(4, Math.round(size * 0.22))}px`,
        objectFit: 'contain',
        flexShrink: 0,
        boxShadow: '0 2px 6px rgba(0, 128, 105, 0.25)',
        ...style,
      }}
    />
  );
};
