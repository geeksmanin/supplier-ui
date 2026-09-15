import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const Variant3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Layer 1 (Bottom) Gradient */}
        <linearGradient id="varLayer1Top" x1="40" y1="60" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>
        <linearGradient id="varLayer1Left" x1="20" y1="80" x2="70" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6B21A8" />
          <stop offset="100%" stopColor="#581C87" />
        </linearGradient>
        <linearGradient id="varLayer1Right" x1="70" y1="80" x2="120" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7E22CE" />
          <stop offset="100%" stopColor="#3B0764" />
        </linearGradient>

        {/* Layer 2 (Middle) Gradient */}
        <linearGradient id="varLayer2Top" x1="40" y1="40" x2="100" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Layer 3 (Top Gem / Variant Node) Gradient */}
        <linearGradient id="varGemTop" x1="50" y1="15" x2="90" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#DB2777" />
        </linearGradient>

        {/* Highlight Gradient */}
        <linearGradient id="varHighlight" x1="50" y1="20" x2="90" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Ground Glow */}
        <radialGradient id="varBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#6B21A8" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#581C87" stopOpacity="0" />
        </radialGradient>

        {/* Soft Drop Shadow */}
        <filter id="varShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#3B0764" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Ground Glow */}
      <ellipse cx="70" cy="134" rx="42" ry="12" fill="url(#varBaseGlow)" />

      {/* Bottom Layer Block */}
      <g filter="url(#varShadow)">
        <path d="M26 84 L70 106 L70 126 L26 104 Z" fill="url(#varLayer1Left)" />
        <path d="M70 106 L114 84 L114 104 L70 126 Z" fill="url(#varLayer1Right)" />
        <path d="M70 64 L114 84 L70 106 L26 84 Z" fill="url(#varLayer1Top)" />
      </g>

      {/* Middle Layer Block (Emerald Shifted) */}
      <g filter="url(#varShadow)">
        <path d="M38 52 L70 68 L70 82 L38 66 Z" fill="#047857" />
        <path d="M70 68 L102 52 L102 66 L70 82 Z" fill="#065F46" />
        <path d="M70 36 L102 52 L70 68 L38 52 Z" fill="url(#varLayer2Top)" />
      </g>

      {/* Top Floating Diamond Variant Node */}
      <g filter="url(#varShadow)">
        <path d="M52 28 L70 37 L70 47 L52 38 Z" fill="#BE185D" />
        <path d="M70 37 L88 28 L88 38 L70 47 Z" fill="#9D174D" />
        <path d="M70 18 L88 28 L70 37 L52 28 Z" fill="url(#varGemTop)" />
      </g>

      {/* Top Specular Highlights */}
      <path d="M70 20 L84 28 L70 35 L56 28 Z" fill="url(#varHighlight)" />
    </svg>
  );
};
