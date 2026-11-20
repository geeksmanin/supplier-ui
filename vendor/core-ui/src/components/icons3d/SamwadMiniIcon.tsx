import React from 'react';

export interface SamwadMiniIconProps {
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const SamwadMiniIcon: React.FC<SamwadMiniIconProps> = ({
  size = 20,
  className,
  style,
}) => {
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
          <stop offset="0%" stopColor="#00A884" />
          <stop offset="55%" stopColor="#008069" />
          <stop offset="100%" stopColor="#054740" />
        </linearGradient>
        <linearGradient id="samwadMiniBubbleGrad" x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#25D366" />
          <stop offset="60%" stopColor="#00A884" />
          <stop offset="100%" stopColor="#005C4B" />
        </linearGradient>
        <linearGradient id="samwadMiniMintGrad" x1="15%" y1="15%" x2="85%" y2="85%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#E2F7CB" />
          <stop offset="100%" stopColor="#C5E898" />
        </linearGradient>
      </defs>
      <rect width="464" height="464" x="24" y="24" rx="112" fill="url(#samwadMiniBgGrad)" />
      <path
        d="M140 136 C220 136 348 136 348 136 C387 136 418 167 418 206 C418 245 387 276 348 276 L254 276 L194 330 L204 276 L140 276 C101 276 70 245 70 206 C70 167 101 136 140 136 Z"
        fill="url(#samwadMiniBubbleGrad)"
      />
      <circle cx="170" cy="206" r="16" fill="#FFFFFF" />
      <circle cx="225" cy="206" r="16" fill="#FFFFFF" />
      <circle cx="280" cy="206" r="16" fill="#FFFFFF" />
      <path
        d="M256 220 C322 220 376 220 376 220 C410 220 436 246 436 280 C436 314 410 340 376 340 L346 340 L320 380 L314 340 L256 340 C222 340 196 314 196 280 C196 246 222 220 256 220 Z"
        fill="url(#samwadMiniMintGrad)"
      />
      <circle cx="285" cy="280" r="12" fill="#008069" />
      <circle cx="335" cy="280" r="12" fill="#008069" />
    </svg>
  );
};
