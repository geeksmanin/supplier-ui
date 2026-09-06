import React from 'react';

export interface Icon3DProps {
  width?: string | number;
  height?: string | number;
  size?: number | string;
  style?: React.CSSProperties;
}

export const Location3DIcon: React.FC<Icon3DProps> = ({
  width = '100%',
  height = '100%',
  size,
  style
}) => {
  const w = size ?? width;
  const h = size ?? height;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 140 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', maxWidth: '100%', maxHeight: '100%', ...style }}
    >
      <defs>
        <linearGradient id="coreLocFrontGrad" x1="40" y1="10" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="40%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <linearGradient id="coreLocRightSide" x1="90" y1="20" x2="120" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        <linearGradient id="coreLocLeftSide" x1="50" y1="20" x2="20" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>

        <linearGradient id="coreLocHighlight" x1="50" y1="15" x2="80" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        <radialGradient id="coreLocBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#059669" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#064E3B" stopOpacity="0" />
        </radialGradient>

        <filter id="coreLocShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#064E3B" floodOpacity="0.45" />
        </filter>
      </defs>

      <ellipse cx="70" cy="132" rx="36" ry="12" fill="url(#coreLocBaseGlow)" />
      <ellipse cx="70" cy="130" rx="28" ry="8" fill="#10B981" opacity="0.2" />

      <path
        d="M48 48 C48 48 42 55 40 68 C38 82 48 105 70 130 L70 122 C52 100 46 78 48 60 C49 52 48 48 48 48Z"
        fill="url(#coreLocLeftSide)"
        opacity="0.95"
      />

      <path
        d="M92 48 C92 48 98 55 100 68 C102 82 92 105 70 130 L70 122 C88 100 94 78 92 60 C91 52 92 48 92 48Z"
        fill="url(#coreLocRightSide)"
        opacity="0.9"
      />

      <path
        d="M70 16 C49 16 32 33 32 54 C32 80 70 130 70 130 C70 130 108 80 108 54 C108 33 91 16 70 16Z"
        fill="url(#coreLocFrontGrad)"
        filter="url(#coreLocShadow)"
      />

      <path
        d="M70 16 C55 16 43 28 40 42 C46 34 58 26 74 28 C88 30 98 42 97 56 C102 44 96 28 70 16Z"
        fill="url(#coreLocHighlight)"
      />

      <circle cx="70" cy="54" r="18" fill="#FFFFFF" />
      <circle cx="70" cy="54" r="10" fill="#10B981" />
      <ellipse cx="62" cy="46" rx="6" ry="4" fill="#FFFFFF" opacity="0.35" />
    </svg>
  );
};
