import React from 'react';

export interface Support3DIconProps {
  width?: string | number;
  height?: string | number;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const Support3DIcon: React.FC<Support3DIconProps> = ({
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
      width={w}
      height={h}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <defs>
        {/* Ambient Ground Shadow */}
        <radialGradient id="suppDropShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00382E" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#00382E" stopOpacity="0" />
        </radialGradient>

        {/* 3D Squircle Base Depth */}
        <linearGradient id="suppBevelGrad" x1="64" y1="20" x2="64" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#004D40" />
          <stop offset="100%" stopColor="#00241E" />
        </linearGradient>

        {/* 3D Squircle Front Face */}
        <linearGradient id="suppFaceGrad" x1="20" y1="14" x2="108" y2="114" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="35%" stopColor="#008069" />
          <stop offset="100%" stopColor="#004D40" />
        </linearGradient>

        {/* Glass Specular Flare */}
        <linearGradient id="suppGlassFlare" x1="24" y1="16" x2="104" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Inner Border Rim Highlight */}
        <linearGradient id="suppInnerRim" x1="64" y1="16" x2="64" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#A7F3D0" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#004D40" stopOpacity="0.3" />
        </linearGradient>

        {/* Headband Chrome Gradient */}
        <linearGradient id="suppHeadbandGrad" x1="36" y1="36" x2="92" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#E2E8F0" />
          <stop offset="70%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        {/* Headband Highlight */}
        <linearGradient id="suppHeadbandShine" x1="64" y1="34" x2="64" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Earcup 3D Gradient (Electric Cyan/Blue) */}
        <linearGradient id="suppEarcupGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        {/* Speech Bubble / Center Assistant Graphic */}
        <linearGradient id="suppBubbleGrad" x1="50" y1="46" x2="78" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>

        {/* AI Golden Star Sparkle */}
        <linearGradient id="suppStarGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="40%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>

        {/* Center Glow Filter */}
        <filter id="suppGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#00382E" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* 1. Ground Ambient Shadow */}
      <ellipse cx="64" cy="116" rx="42" ry="7" fill="url(#suppDropShadow)" />

      {/* 2. 3D Squircle Base Depth */}
      <rect x="18" y="20" width="92" height="92" rx="28" fill="url(#suppBevelGrad)" />

      {/* 3. 3D Squircle Front Face */}
      <rect x="18" y="16" width="92" height="92" rx="28" fill="url(#suppFaceGrad)" filter="url(#suppGlow)" />

      {/* 4. Inner Rim Highlight */}
      <rect x="19" y="17" width="90" height="90" rx="27" stroke="url(#suppInnerRim)" strokeWidth="1.5" fill="none" />

      {/* 5. Glass Specular Flare */}
      <path
        d="M 28 20 C 48 17, 80 17, 100 20 C 103 24, 96 34, 82 38 C 54 44, 32 36, 28 20 Z"
        fill="url(#suppGlassFlare)"
      />

      {/* 6. 3D Metallic Headband */}
      <path
        d="M 37 66 C 37 40, 91 40, 91 66"
        stroke="url(#suppHeadbandGrad)"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 42 60 C 42 43, 86 43, 86 60"
        stroke="url(#suppHeadbandShine)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* 7. Left Earcup */}
      <g filter="url(#suppGlow)">
        {/* Depth shadow */}
        <rect x="29" y="58" width="12" height="22" rx="6" fill="#00241E" />
        {/* Main cup */}
        <rect x="29" y="55" width="12" height="22" rx="6" fill="url(#suppEarcupGrad)" />
        {/* Inner cushion ring */}
        <rect x="36" y="58" width="4" height="16" rx="2" fill="#00382E" />
        {/* Specular highlight */}
        <ellipse cx="33" cy="62" rx="2" ry="4" fill="#FFFFFF" opacity="0.6" />
      </g>

      {/* 8. Right Earcup */}
      <g filter="url(#suppGlow)">
        {/* Depth shadow */}
        <rect x="87" y="58" width="12" height="22" rx="6" fill="#00241E" />
        {/* Main cup */}
        <rect x="87" y="55" width="12" height="22" rx="6" fill="url(#suppEarcupGrad)" />
        {/* Inner cushion ring */}
        <rect x="88" y="58" width="4" height="16" rx="2" fill="#00382E" />
        {/* Specular highlight */}
        <ellipse cx="93" cy="62" rx="2" ry="4" fill="#FFFFFF" opacity="0.6" />
      </g>

      {/* 9. Microphone Boom & Glowing Capsule */}
      <path
        d="M 38 73 C 40 86, 54 91, 66 89"
        stroke="#CBD5E1"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="68" cy="88" rx="4.5" ry="3.5" fill="url(#suppEarcupGrad)" />
      <circle cx="68" cy="88" r="1.5" fill="#38BDF8" />

      {/* 10. Center Assistant Speech Bubble */}
      <g filter="url(#suppGlow)">
        <path
          d="M 52 53 C 52 47, 76 47, 76 53 C 76 59, 68 63, 64 63 L 59 67 L 60 62 C 55 61, 52 58, 52 53 Z"
          fill="url(#suppBubbleGrad)"
        />
        {/* Subtle horizontal pulse bars inside the bubble */}
        <rect x="57" y="52" width="14" height="2" rx="1" fill="#008069" opacity="0.75" />
        <rect x="59" y="56" width="10" height="1.8" rx="0.9" fill="#008069" opacity="0.5" />
      </g>

      {/* 11. AI 4-Point Golden Sparkle (Top-Right) */}
      <g>
        <path
          d="M 78 40 Q 80 44 84 45 Q 80 46 78 50 Q 77 46 73 45 Q 77 44 78 40 Z"
          fill="url(#suppStarGrad)"
        />
        <circle cx="78" cy="45" r="1.2" fill="#FFFFFF" />
      </g>
    </svg>
  );
};
